import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

interface PriceDropNotificationInput {
  productId: string;
  productName: string;
  productUrl: string;
  imageUrl?: string | null;
  store: string;
  currency: string;
  previousPrice: number;
  currentPrice: number;
  notifiedAt: Date;
}

@Injectable()
export class PriceDropNotificationService {
  private readonly logger = new Logger(PriceDropNotificationService.name);
  private readonly resendApiKey: string | undefined;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      'onboarding@resend.dev';
  }

  async notifyInterestedUsers(
    input: PriceDropNotificationInput,
  ): Promise<void> {
    if (!this.resendApiKey) {
      this.logger.warn(
        `Skipping price drop notification for product ${input.productId} because RESEND_API_KEY is missing.`,
      );
      return;
    }

    const favorites = await this.prisma.favorite.findMany({
      where: {
        productId: input.productId,
        notificationsEnabled: true,
        OR: [
          { lastNotifiedAt: null },
          { lastNotifiedAt: { lt: input.notifiedAt } },
        ],
      },
      select: {
        id: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (favorites.length === 0) {
      return;
    }

    const resend = new Resend(this.resendApiKey);
    const successfulFavoriteIds: string[] = [];

    const results = await Promise.allSettled(
      favorites.map(async (favorite) => {
        const { email, name } = favorite.user;

        await resend.emails.send({
          from: this.fromEmail,
          to: email,
          subject: `Bajo el precio de ${input.productName}`,
          text: this.buildTextBody({
            name,
            ...input,
          }),
          html: this.buildHtmlBody({
            name,
            ...input,
          }),
        });

        successfulFavoriteIds.push(favorite.id);
      }),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const favorite = favorites[index];

        this.logger.error(
          `Failed to send price drop email to ${favorite.user.email}: ${this.getErrorMessage(result.reason)}`,
        );
      }
    });

    if (successfulFavoriteIds.length > 0) {
      await this.prisma.favorite.updateMany({
        where: {
          id: {
            in: successfulFavoriteIds,
          },
        },
        data: {
          lastNotifiedAt: input.notifiedAt,
        },
      });
    }
  }

  private buildTextBody(
    input: PriceDropNotificationInput & { name?: string | null },
  ): string {
    const formattedPreviousPrice = this.formatPrice(
      input.previousPrice,
      input.currency,
    );
    const formattedCurrentPrice = this.formatPrice(
      input.currentPrice,
      input.currency,
    );

    return [
      `Hola${input.name ? ` ${input.name}` : ''},`,
      '',
      `El producto que tenes en favoritos bajo de precio en ${input.store}.`,
      '',
      `Producto: ${input.productName}`,
      `Precio anterior: ${formattedPreviousPrice}`,
      `Precio actual: ${formattedCurrentPrice}`,
      `Link: ${input.productUrl}`,
      '',
      'TechCruce',
    ].join('\n');
  }

  private buildHtmlBody(
    input: PriceDropNotificationInput & { name?: string | null },
  ): string {
    const formattedPreviousPrice = this.formatPrice(
      input.previousPrice,
      input.currency,
    );
    const formattedCurrentPrice = this.formatPrice(
      input.currentPrice,
      input.currency,
    );
    const greeting = input.name ? `Hola ${input.name}` : 'Hola';
    const imageMarkup = input.imageUrl
      ? `<img src="${input.imageUrl}" alt="${this.escapeHtml(input.productName)}" style="max-width: 220px; width: 100%; border-radius: 12px; display: block; margin-bottom: 16px;" />`
      : '';

    return `
      <div style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 24px; color: #1f2937;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb;">
          <p style="margin-top: 0; font-size: 16px;">${this.escapeHtml(greeting)},</p>
          <p style="font-size: 16px; line-height: 1.6;">
            El producto que tenes en favoritos bajo de precio en <strong>${this.escapeHtml(input.store)}</strong>.
          </p>
          ${imageMarkup}
          <h2 style="margin: 0 0 12px; font-size: 20px; line-height: 1.4;">${this.escapeHtml(input.productName)}</h2>
          <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Precio anterior</p>
          <p style="margin: 0 0 16px; font-size: 18px; text-decoration: line-through; color: #9ca3af;">${this.escapeHtml(formattedPreviousPrice)}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Precio actual</p>
          <p style="margin: 0 0 24px; font-size: 28px; font-weight: 700; color: #059669;">${this.escapeHtml(formattedCurrentPrice)}</p>
          <a href="${input.productUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;">
            Ver producto
          </a>
        </div>
      </div>
    `;
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
