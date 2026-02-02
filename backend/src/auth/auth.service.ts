import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {
    // Configurar transporte de email (usando Gmail como ejemplo)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass) {
      // Para desarrollo, usar Ethereal Email (gratuito)
      this.emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    }
  }

  async requestOtp(email: string) {
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar el código en la base de datos
    await this.prisma.otp.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Enviar email si está configurado
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Código de verificación Bahía Go',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #00C853;">Bahía Go</h2>
              <p>Tu código de verificación es:</p>
              <h1 style="color: #00C853; font-size: 32px; letter-spacing: 5px;">${code}</h1>
              <p>Este código expira en 10 minutos.</p>
              <p>Si no solicitaste este código, ignora este mensaje.</p>
            </div>
          `,
        });
        console.log(`OTP code sent to ${email}: ${code}`);
        return { message: 'OTP sent to email' };
      } catch (error) {
        console.error('Error sending email:', error);
        // Continuar con el código guardado en BD
      }
    }

    console.log(`OTP code saved for ${email}: ${code}`);
    return { message: 'OTP saved' };
  }

  async verifyOtp(email: string, code: string) {
    // Buscar el código OTP válido para este email
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc', // Tomar el más reciente
      },
    });

    if (!otp) {
      throw new Error('Invalid or expired code');
    }

    // Marcar el código como usado
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Crear o encontrar usuario
    let user = await this.prisma.user.findUnique({ where: { email } });
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const shouldBeAdmin = adminEmails.includes(email.toLowerCase());

    if (!user) {
      user = await this.prisma.user.create({ data: { email, role: shouldBeAdmin ? 'ADMIN' : 'USER' } });
    } else if (shouldBeAdmin && user.role !== 'ADMIN') {
      user = await this.prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    return { access_token: token, user };
  }

  private assignRole(email: string, currentRole?: string) {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const shouldBeAdmin = adminEmails.includes(email.toLowerCase());
    if (shouldBeAdmin) return 'ADMIN';
    return currentRole || 'USER';
  }

  async registerPassword(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    const role = this.assignRole(email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      throw new Error('El usuario ya tiene contraseña');
    }
    const user = existing
      ? await this.prisma.user.update({ where: { email }, data: { passwordHash: hash, role } })
      : await this.prisma.user.create({ data: { email, passwordHash: hash, role } });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);
    return { access_token: token, user };
  }

  async loginPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new Error('Usuario o contraseña inválidos');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new Error('Usuario o contraseña inválidos');
    }
    // ensure admin role if listed
    const role = this.assignRole(email, user.role);
    const updated = role !== user.role
      ? await this.prisma.user.update({ where: { email }, data: { role } })
      : user;

    const payload = { userId: updated.id, email: updated.email, role: updated.role };
    const token = this.jwt.sign(payload);
    return { access_token: token, user: updated };
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    // No exponer passwordHash
    const { passwordHash, ...rest } = user as any;
    return rest;
  }
}