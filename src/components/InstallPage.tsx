import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Loader, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { installationService } from '../services/installation';
import { useAuth } from '../hooks/useAuth';

const InstallPage: React.FC = () => {
  const { signUp } = useAuth();
  const [installationStep, setInstallationStep] = useState<'checking' | 'installing' | 'admin-setup' | 'completed'>('checking');
  const [isInstalled, setIsInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      setError(null);
      const status = await installationService.checkInstallationStatus();
      setIsInstalled(status.isInstalled);
      
      if (status.isInstalled) {
        setInstallationStep('completed');
      } else {
        setInstallationStep('installing');
        await performInstallation();
      }
    } catch (err) {
      console.error('Installation check error:', err);
      setInstallationStep('installing');
      await performInstallation();
    }
  };

  const performInstallation = async () => {
    try {
      setError(null);
      const success = await installationService.performInstallation();
      
      if (success) {
        setInstallationStep('admin-setup');
      } else {
        setError('Не удалось инициализировать базу данных. Попробуйте обновить страницу.');
      }
    } catch (err) {
      setError('Ошибка при установке. Попробуйте обновить страницу.');
      console.error('Installation error:', err);
    }
  };

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminData.password !== adminData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (adminData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await signUp(adminData.email, adminData.password);
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      await installationService.completeInstallation();
      setInstallationStep('completed');
    } catch (err) {
      setError('Не удалось создать аккаунт администратора');
      console.error('Admin setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (installationStep) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Проверка установки</h2>
            <p className="text-gray-400">Пожалуйста, подождите, пока мы проверяем состояние системы...</p>
          </div>
        );

      case 'installing':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Установка базы данных</h2>
            <p className="text-gray-400 mb-6">Создание таблиц базы данных и начальной конфигурации...</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Создание таблиц базы данных</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Настройка политик безопасности</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Вставка данных по умолчанию</span>
              </div>
            </div>
          </div>
        );

      case 'admin-setup':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Создание аккаунта администратора</h2>
              <p className="text-gray-400">Настройте аккаунт администратора для управления платформой</p>
            </div>

            <form onSubmit={handleAdminSetup} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email адрес
                </label>
                <input
                  type="email"
                  id="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Введите надежный пароль"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={adminData.confirmPassword}
                  onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Подтвердите ваш пароль"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Создать аккаунт администратора
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 text-sm font-medium mb-1">Уведомление о безопасности</p>
                  <p className="text-blue-300 text-xs">
                    Это будет ваш основной аккаунт администратора. Убедитесь, что используете надежный пароль и храните учетные данные в безопасности.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">🎉 Установка завершена!</h2>
            <p className="text-gray-400 mb-8">
              AirdropHub был успешно установлен и настроен. Теперь вы можете начать использовать платформу.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Настройка базы данных</h3>
                <p className="text-sm text-gray-400">Все таблицы и политики безопасности созданы</p>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Аккаунт администратора</h3>
                <p className="text-sm text-gray-400">Аккаунт администратора настроен</p>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Токены по умолчанию</h3>
                <p className="text-sm text-gray-400">Белый список заполнен популярными токенами</p>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Конфигурация API</h3>
                <p className="text-sm text-gray-400">Ethplorer API готов к использованию</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-5 h-5" />
                Перейти на главную
              </a>
              <a
                href="/admin"
                className="flex-1 bg-gray-700/50 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-600/50 transition-colors border border-gray-600 flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Панель администратора
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      <div className="relative w-full max-w-2xl">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default InstallPage;