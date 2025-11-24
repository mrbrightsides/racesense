'use client'

import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface DramaticAlertProps {
  show: boolean;
  urgency: 'low' | 'medium' | 'high';
  message: string;
  details?: string;
}

export function DramaticAlert({ show, urgency, message, details }: DramaticAlertProps): React.JSX.Element | null {
  if (!show) return null;

  const isHighUrgency = urgency === 'high';
  
  return (
    <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-500 ${
      isHighUrgency ? 'animate-pulse' : ''
    }`}>
      <Card className={`w-96 border-2 shadow-2xl ${
        isHighUrgency 
          ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
          : urgency === 'medium'
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
          : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
      }`}>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              isHighUrgency 
                ? 'bg-red-500' 
                : urgency === 'medium'
                ? 'bg-orange-500'
                : 'bg-blue-500'
            }`}>
              {isHighUrgency ? (
                <AlertTriangle className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isHighUrgency ? 'destructive' : 'secondary'} className="uppercase">
                  {urgency} Priority
                </Badge>
                {isHighUrgency && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-foreground">
                {message}
              </p>
              {details && (
                <p className="text-sm text-muted-foreground mt-1">
                  {details}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
