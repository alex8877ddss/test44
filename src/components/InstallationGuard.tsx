import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { installationService } from '../services/installation';

interface InstallationGuardProps {
  children: React.ReactNode;
}

const InstallationGuard: React.FC<InstallationGuardProps> = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInstallation();
  }, []);

  const checkInstallation = async () => {
    try {
      const status = await installationService.checkInstallationStatus();
      setIsInstalled(status.isInstalled);
    } catch (error) {
      console.error('Error checking installation:', error);
      setIsInstalled(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isInstalled === false) {
    return <Navigate to="/install" replace />;
  }

  return <>{children}</>;
};

export default InstallationGuard;