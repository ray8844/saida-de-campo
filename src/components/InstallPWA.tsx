import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <section className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg shadow-emerald-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Smartphone size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold">Instalar Aplicativo</h3>
          <p className="text-emerald-50 text-sm">
            Acesse o sistema mais rápido instalando-o no seu dispositivo.
          </p>
        </div>
      </div>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-all whitespace-nowrap"
      >
        <Download size={20} />
        Instalar Agora
      </button>
    </section>
  );
}
