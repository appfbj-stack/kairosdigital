import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { LeadsModule } from './leads/leads.module';
import { DealsModule } from './deals/deals.module';
import { TasksModule } from './tasks/tasks.module';
import { ConversationsModule } from './conversations/conversations.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    WhatsAppModule,
    LeadsModule,
    DealsModule,
    TasksModule,
    ConversationsModule,
    KnowledgeModule,
    TemplatesModule,
  ],
})
export class AppModule {}