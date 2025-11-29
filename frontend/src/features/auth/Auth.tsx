import React, { useState } from 'react';
import { db } from '../../services/db';
import type { User } from '../../types/schema';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleBiometricLogin = async () => {
    if ('credentials' in navigator) {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
        },
      });
      if (credential) {
        // TODO: link to user
        alert('Biometric login successful');
      }
    }
  };

  const handlePinLogin = async () => {
    if (pin.length === 4) {
      const user = await db.authenticateUser(email, pin);
      if (user) {
        alert('Login successful');
        // TODO: set user in store
      } else {
        alert('Invalid credentials');
      }
    }
  };

  const handleRegister = async () => {
    if (email && pin.length === 4) {
      const user: User = {
        id: email,
        email,
        pin,
        farmType: 'mixed',
        location: 'Kericho'
      };
      await db.addUser(user);
      alert('Registration successful');
      setIsLogin(true);
    }
  };

  return (
    <div className="auth-container p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      <button onClick={handleBiometricLogin} className="w-full bg-blue-500 text-white p-3 rounded mb-4">
        Login with Biometric
      </button>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <input
        type="password"
        placeholder="4-digit PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={4}
        className="w-full p-3 border rounded mb-4"
      />
      {isLogin ? (
        <button onClick={handlePinLogin} className="w-full bg-green-500 text-white p-3 rounded">
          Login with PIN
        </button>
      ) : (
        <button onClick={handleRegister} className="w-full bg-green-500 text-white p-3 rounded">
          Register
        </button>
      )}
      <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-blue-500">
        {isLogin ? 'Need to register?' : 'Already have account?'}
      </button>
    </div>
  );
};
