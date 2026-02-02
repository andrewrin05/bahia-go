import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BoatsModule } from './boats/boats.module';
import { BookingsModule } from './bookings/bookings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MessagesModule } from './messages/messages.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    BoatsModule,
    BookingsModule,
    FavoritesModule,
    MessagesModule,
    SavedSearchesModule,
    PaymentsModule,
  ],
})
export class AppModule {}