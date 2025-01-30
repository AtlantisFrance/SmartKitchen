import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserCircle2, Mail, Building2, User, Lock, ChevronRight, ArrowLeft } from 'lucide-react';

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              surname,
              company,
            },
          },
        });

        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "appearance-none rounded-lg relative block w-full pl-12 pr-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 hover:border-blue-300";
  const iconClasses = "h-5 w-5 text-gray-400";
  const iconContainerClasses = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column - Branding */}
      <div className="flex flex-col w-full lg:w-1/2 bg-blue-600 relative min-h-[120px] lg:min-h-screen">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&q=80"
            alt="Modern kitchen design"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-4 lg:p-12 text-white h-full">
          {/* Mobile View */}
          <div className="lg:hidden flex items-center w-full max-w-[280px] mx-auto mb-4">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm ring-1 ring-white/30 mr-3 flex-shrink-0">
              <Building2 className="w-[clamp(2rem,6vw,2.5rem)] h-[clamp(2rem,6vw,2.5rem)] text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(1.25rem,5vw,1.75rem)] font-bold leading-tight tracking-tight">Sm@rt Kitchen</h1>
              <p className="text-[clamp(0.875rem,4vw,1.125rem)] text-blue-100 leading-tight opacity-90">AI-Powered Architectural Kitchen Design</p>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:flex-1">
            <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm mb-6 ring-1 ring-white/30">
              <Building2 className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Sm@rt Kitchen</h1>
            <p className="text-xl text-blue-100 text-center max-w-md">
              AI-Powered Architectural Kitchen Design
            </p>
            <div className="mt-12 space-y-6 text-center max-w-lg">
              <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm ring-1 ring-white/20">
                <h3 className="text-xl font-semibold mb-3">Transformez votre cuisine</h3>
                <p className="text-blue-100">
                  Utilisez l'intelligence artificielle pour créer des designs de cuisine uniques et innovants
                </p>
              </div>
              <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm ring-1 ring-white/20">
                <h3 className="text-xl font-semibold mb-3">Design professionnel</h3>
                <p className="text-blue-100">
                  Créez des designs de cuisine professionnels en quelques clics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-gray-50 relative">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80"
            alt="Elegant kitchen interior"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-gray-900 mb-3">
            {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </h2>
          <p className="text-gray-600 text-[clamp(0.875rem,3.5vw,1rem)] max-w-sm">
            {isSignUp 
              ? 'Rejoignez-nous pour commencer à concevoir votre cuisine de rêve'
              : 'Bon retour ! Veuillez saisir vos informations'}
          </p>
          <form className="mt-[clamp(1.5rem,6vw,2rem)] space-y-[clamp(1rem,4vw,1.5rem)] bg-white p-[clamp(1.25rem,5vw,2rem)] rounded-2xl shadow-xl" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="relative">
                <div className={iconContainerClasses}>
                  <Mail className={iconClasses} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="Adresse e-mail"
                />
              </div>

              <div className="relative">
                <div className={iconContainerClasses}>
                  <Lock className={iconClasses} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="Mot de passe"
                />
              </div>

              {isSignUp && (
                <>
                  <div className="relative">
                    <div className={iconContainerClasses}>
                      <UserCircle2 className={iconClasses} />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                      placeholder="Prénom"
                    />
                  </div>

                  <div className="relative">
                    <div className={iconContainerClasses}>
                      <User className={iconClasses} />
                    </div>
                    <input
                      id="surname"
                      name="surname"
                      type="text"
                      required
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className={inputClasses}
                      placeholder="Nom"
                    />
                  </div>

                  <div className="relative">
                    <div className={iconContainerClasses}>
                      <Building2 className={iconClasses} />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={inputClasses}
                      placeholder="Entreprise"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Créer un compte' : 'Se connecter'}
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-base font-medium text-gray-700">
                  {isSignUp ? 'Déjà inscrit ?' : 'Pas encore de compte ?'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsSignUp(!isSignUp);
                }}
                className="w-full inline-flex items-center justify-center py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-900 font-medium transition-all duration-200 shadow-sm"
              >
                {isSignUp ? 'Se connecter' : 'Créer un compte'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              En continuant, vous acceptez nos{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">Conditions d'utilisation</a>
              {' '}et notre{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}