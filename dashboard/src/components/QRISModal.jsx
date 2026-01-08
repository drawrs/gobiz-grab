import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, QrCode, Wallet, AlertCircle, Check, Camera } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { convertQRIS, isValidQRIS, parseQRISInfo } from '../lib/qris';

const STORAGE_KEY = 'gobiz_static_qris';

export function QRISModal({ isOpen, onClose }) {
    const [staticQRIS, setStaticQRIS] = useState('');
    const [amount, setAmount] = useState('');
    const [dynamicQRIS, setDynamicQRIS] = useState('');
    const [error, setError] = useState('');
    const [merchantInfo, setMerchantInfo] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    // Load saved QRIS from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setStaticQRIS(saved);
            setMerchantInfo(parseQRISInfo(saved));
        }
    }, []);

    // Save QRIS to localStorage when valid
    const saveQRIS = useCallback((qris) => {
        if (isValidQRIS(qris)) {
            localStorage.setItem(STORAGE_KEY, qris);
            setStaticQRIS(qris);
            setMerchantInfo(parseQRISInfo(qris));
            setError('');
        } else {
            setError('Format QRIS tidak valid');
        }
    }, []);

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setError('');

        try {
            const image = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                saveQRIS(code.data);
            } else {
                setError('Tidak dapat membaca QR code dari gambar');
            }
        } catch (err) {
            setError('Gagal memproses gambar: ' + err.message);
        } finally {
            setIsScanning(false);
        }
    };

    // Handle manual text input
    const handleManualInput = (e) => {
        const value = e.target.value.trim();
        setStaticQRIS(value);
        if (value && isValidQRIS(value)) {
            saveQRIS(value);
        }
    };

    // Generate dynamic QRIS
    const handleGenerate = () => {
        setError('');
        const numAmount = parseInt(amount.replace(/\D/g, ''));

        if (!numAmount || numAmount <= 0) {
            setError('Masukkan nominal yang valid');
            return;
        }

        try {
            const result = convertQRIS(staticQRIS, numAmount);
            setDynamicQRIS(result);
        } catch (err) {
            setError('Gagal membuat QRIS: ' + err.message);
        }
    };

    // Format amount input
    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value) {
            setAmount(new Intl.NumberFormat('id-ID').format(parseInt(value)));
        } else {
            setAmount('');
        }
        setDynamicQRIS(''); // Reset generated QR when amount changes
    };

    // Reset and clear
    const handleReset = () => {
        localStorage.removeItem(STORAGE_KEY);
        setStaticQRIS('');
        setMerchantInfo(null);
        setDynamicQRIS('');
        setAmount('');
    };

    if (!isOpen) return null;

    const hasStaticQRIS = isValidQRIS(staticQRIS);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-md max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-dark-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/20 rounded-lg">
                                <QrCode className="w-5 h-5 text-primary-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Generate Dynamic QRIS</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Upload / Static QRIS Section */}
                        {!hasStaticQRIS ? (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm">
                                    Upload gambar QRIS statis Anda untuk mulai membuat QRIS dinamis dengan nominal tertentu.
                                </p>

                                {/* Upload Button */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-dark-600 hover:border-primary-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {isScanning ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-gray-400 text-sm">Memindai QR code...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                                            <p className="text-gray-400 text-sm">Klik untuk upload gambar QRIS</p>
                                            <p className="text-gray-500 text-xs mt-1">PNG, JPG hingga 5MB</p>
                                        </>
                                    )}
                                </div>

                                {/* Manual Input */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Atau masukkan kode QRIS manual:</label>
                                    <textarea
                                        value={staticQRIS}
                                        onChange={handleManualInput}
                                        placeholder="000201010211..."
                                        className="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Merchant Info */}
                                {merchantInfo && (
                                    <div className="bg-dark-700/50 rounded-lg p-3 flex items-center gap-3">
                                        <div className="p-2 bg-primary-500/20 rounded-lg">
                                            <Wallet className="w-4 h-4 text-primary-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{merchantInfo.merchantName}</p>
                                            <p className="text-gray-500 text-xs truncate">{merchantInfo.city}</p>
                                        </div>
                                        <button
                                            onClick={handleReset}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                )}

                                {/* Amount Input */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Nominal (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                        <input
                                            type="text"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="0"
                                            className="w-full bg-dark-700 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!amount}
                                    className="w-full bg-primary-500 hover:bg-primary-500/90 disabled:bg-dark-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Generate QRIS
                                </button>

                                {/* Generated QR Code */}
                                {dynamicQRIS && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-4 rounded-xl flex flex-col items-center gap-3"
                                    >
                                        <QRCodeSVG value={dynamicQRIS} size={200} />
                                        <div className="text-center">
                                            <p className="text-dark-800 font-bold text-lg">
                                                Rp {amount}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">Scan dengan aplikasi e-wallet</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
