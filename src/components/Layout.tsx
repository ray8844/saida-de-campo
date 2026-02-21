import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 mt-1"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

export function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
        <Settings size={32} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Módulo {title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
        Este módulo está em desenvolvimento. Em breve você poderá gerenciar todas as informações aqui.
      </p>
    </div>
  );
}

import { Settings } from 'lucide-react';
