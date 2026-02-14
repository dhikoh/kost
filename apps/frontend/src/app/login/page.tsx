'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeReg, faUser as faUserReg } from '@fortawesome/free-regular-svg-icons';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/context/AuthContext';

type FormType = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
    const [mounted, setMounted] = useState(false);
    const [activeForm, setActiveForm] = useState<FormType>('login');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [wrapperHeight, setWrapperHeight] = useState<number | 'auto'>('auto');

    const loginRef = useRef<HTMLDivElement>(null);
    const signupRef = useRef<HTMLDivElement>(null);
    const forgotRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const { login, register } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let activeRef = loginRef;
        if (activeForm === 'signup') activeRef = signupRef;
        if (activeForm === 'forgot') activeRef = forgotRef;

        if (activeRef.current) {
            setWrapperHeight(activeRef.current.offsetHeight);
        }
    }, [activeForm, mounted]);

    const switchForm = (formName: FormType) => {
        if (activeForm === formName) return;
        setIsAnimating(true);
        setActiveForm(formName);
        setTimeout(() => setIsAnimating(false), 600);
    };

    const handleSubmit = async (e: React.FormEvent, type: FormType) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (type === 'login') {
                // Use Auth Context
                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                await login(email, password);
            } else if (type === 'signup') {
                const fullName = (e.currentTarget.elements.namedItem('fullName') as HTMLInputElement).value;
                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                const phone = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value;
                const kostName = (e.currentTarget.elements.namedItem('kostName') as HTMLInputElement).value;

                await register({ email, pass: password, fullName, phone, kostName });
            } else {
                toast.success('Registrasi Berhasil!', { description: 'Silahkan login.' });
                switchForm('login');
            } else {
                toast.success('Email Reset Terkirim!', { description: 'Cek inbox Anda.' });
                switchForm('login');
            }
        } catch (err) {
            toast.error('Terjadi Kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return <div className="min-h-screen bg-[#ecf0f3]" />;

    return (
        <div className="flex justify-center items-start min-h-screen bg-[#ecf0f3] overflow-hidden py-5 pt-[5vh] font-sans text-gray-700 select-none">
            <Toaster position="top-right" />

            <div className={styles.bgDecoText}>KOST</div>

            <div className={styles.container}>
                <div className={styles.loginCard}>
                    {/* LOGO ANIMATION */}
                    <div className={`${styles.logoContainer} ${isAnimating ? styles.animatingFlip : ''}`}>
                        <svg className={styles.customLogoSvg} viewBox="0 0 200 200">
                            {/* BASE SHAPE */}
                            <rect x="50" y="50" width="100" height="100" rx="20" fill="none" stroke="var(--teal-btn)" strokeWidth="8" />
                            <path d="M50 80 L100 40 L150 80" fill="none" stroke="var(--teal-btn)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

                            {/* LOGIN MODE */}
                            <g className={`${styles.logoGroup} ${activeForm === 'login' ? styles.active : ''}`}>
                                <circle cx="100" cy="100" r="15" fill="var(--teal-btn)" />
                                <rect x="85" y="125" width="30" height="20" rx="5" fill="var(--teal-btn)" />
                            </g>

                            {/* SIGNUP MODE */}
                            <g className={`${styles.logoGroup} ${activeForm === 'signup' ? styles.active : ''}`}>
                                <line x1="100" y1="80" x2="100" y2="120" stroke="var(--teal-btn)" strokeWidth="8" strokeLinecap="round" />
                                <line x1="80" y1="100" x2="120" y2="100" stroke="var(--teal-btn)" strokeWidth="8" strokeLinecap="round" />
                            </g>
                        </svg>
                    </div>

                    <div className={styles.brandName}>KOST MANAGER</div>
                    <div className={styles.subName}>Smart Property System</div>

                    <div className={styles.formWrapper} style={{ height: wrapperHeight }}>

                        {/* 1. LOGIN FORM */}
                        <div ref={loginRef} className={`${styles.formSection} ${activeForm === 'login' ? styles.active : ''}`}>
                            <form onSubmit={(e) => handleSubmit(e, 'login')}>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faEnvelopeReg} className={styles.inputIcon} />
                                    <input type="email" name="email" className={styles.formInput} placeholder="Email" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                    <input type={showPassword ? "text" : "password"} name="password" className={styles.formInput} placeholder="Password" required />
                                    <div className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </div>
                                </div>
                                <button type="submit" className={styles.btnAction} disabled={isLoading}>
                                    {isLoading ? 'Loading...' : 'LOGIN'}
                                </button>
                            </form>
                            <div className={styles.footerLinks}>
                                Belum punya akun? <span className={styles.linkText} onClick={() => switchForm('signup')}>Daftar</span>
                            </div>
                        </div>

                        {/* 2. SIGNUP FORM */}
                        <div ref={signupRef} className={`${styles.formSection} ${activeForm === 'signup' ? styles.active : ''}`}>
                            <form onSubmit={(e) => handleSubmit(e, 'signup')}>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faUserReg} className={styles.inputIcon} />
                                    <input type="text" name="fullName" className={styles.formInput} placeholder="Nama Lengkap" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faEnvelopeReg} className={styles.inputIcon} />
                                    <input type="email" name="email" className={styles.formInput} placeholder="Email" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faUserReg} className={styles.inputIcon} />
                                    <input type="text" name="phone" className={styles.formInput} placeholder="No. WhatsApp" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faUserReg} className={styles.inputIcon} />
                                    <input type="text" name="kostName" className={styles.formInput} placeholder="Nama Kost" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                    <input type="password" name="password" className={styles.formInput} placeholder="Password" required />
                                </div>
                                <button type="submit" className={styles.btnAction} disabled={isLoading}>
                                    {isLoading ? 'Loading...' : 'REGISTER'}
                                </button>
                            </form>
                            <div className={styles.footerLinks}>
                                Sudah punya akun? <span className={styles.linkText} onClick={() => switchForm('login')}>Login</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
