"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('Attempting login with:', { login, password: '***' });
      const result = await signIn("credentials", {
        login,
        password,
        redirect: false,
      });
      
      console.log('SignIn result:', result);

      if (result?.error) {
        console.log('Login error:', result.error);
        setError("Неверный логин или пароль");
      } else {
        console.log('Login successful, getting session...');
        const session = await getSession();
        console.log('Session:', session);
        if (session && session.user?.role === 'ADMIN') {
          // Определяем текущий домен и создаем админский поддомен динамически
          const currentHost = window.location.host;
          const protocol = window.location.protocol;
          
          // Если мы уже на админском поддомене, просто переходим в dashboard
          if (currentHost.startsWith('admin.')) {
            window.location.href = `${protocol}//${currentHost}/dashboard`;
          } else {
            // Создаем админский поддомен из текущего домена
            const adminHost = `admin.${currentHost}`;
            window.location.href = `${protocol}//${adminHost}/dashboard`;
          }
        } else if (session) {
          setError("У вас нет прав администратора");
        }
      }
    } catch (error) {
      console.error('Login exception:', error);
      setError("Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Вход в админ-панель
          </CardTitle>
          <p className="text-gray-600">Laddex</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                type="text"
                id="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Введите пароль"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
