import React, { useState } from 'react';
import { Loader2, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { SignupFormData } from '../../types/auth';

const INITIAL_DATA: SignupFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: '',
  gender: 'Male',
  city: '',
  phone: '',
  income_range: 'Below ₹20 thousand',
  capital_bucket: 'Below ₹10,000',
  experience_level: 'Beginner',
  trading_duration: 'Less than 6 months',
};

export const SignupForm: React.FC = () => {
  const { setAuthView } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name || !formData.age || !formData.city || !formData.phone) {
      setError("Please fill in all fields.");
      return false;
    }
    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const checkDuplicatePhone = async (phone: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_phone_exists', { phone_number: phone });
      if (!error) return !!data;
      
      const { data: selectData } = await supabase.from('user_profiles').select('id').eq('phone', phone).single();
      return !!selectData;
    } catch (e) {
      return false;
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const isPhoneTaken = await checkDuplicatePhone(formData.phone);
      if (isPhoneTaken) {
        throw new Error("This phone number is already registered.");
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            city: formData.city,
            phone: formData.phone,
            income_range: formData.income_range,
            capital_bucket: formData.capital_bucket,
            experience_level: formData.experience_level,
            trading_duration: formData.trading_duration
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              age: parseInt(formData.age),
              gender: formData.gender,
              city: formData.city,
              phone: formData.phone,
              income_range: formData.income_range,
              capital_bucket: formData.capital_bucket,
              experience_level: formData.experience_level,
              trading_duration: formData.trading_duration
            }
          ]);

        if (profileError) {
            if (profileError.code !== '42501') {
                console.error("Profile creation error:", profileError);
            }
        }
      }

      setStep(4);
      
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
    }
  };

  if (step === 4) {
    return (
      <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-main)]">Account Created!</h3>
          <p className="text-[var(--text-muted)] mt-2">
            Registration successful. Please check your email to confirm your account before logging in.
          </p>
        </div>
        <button 
          onClick={() => setAuthView('login')}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-bold py-3 rounded-lg transition-all mt-6"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--border-secondary)]'}`} />
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => updateField('email', e.target.value)} 
                className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="you@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password} 
                  onChange={e => updateField('password', e.target.value)} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none pr-10"
                  placeholder="Create a password" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.confirmPassword} 
                  onChange={e => updateField('confirmPassword', e.target.value)} 
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none pr-10"
                  placeholder="Confirm password" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
           <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
             <div>
               <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Full Name</label>
               <input type="text" required value={formData.name} onChange={e => updateField('name', e.target.value)} 
                 className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                 placeholder="Your Name" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Age</label>
                 <input type="number" required value={formData.age} onChange={e => updateField('age', e.target.value)} 
                   className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                   placeholder="25" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Gender</label>
                 <select value={formData.gender} onChange={e => updateField('gender', e.target.value)}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none">
                   <option>Male</option>
                   <option>Female</option>
                   <option>Other</option>
                   <option>Prefer not to say</option>
                 </select>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Phone Number</label>
               <input type="tel" required value={formData.phone} onChange={e => updateField('phone', e.target.value)} 
                 className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                 placeholder="+91 XXXXX XXXXX" />
             </div>
             <div>
               <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">City</label>
               <input type="text" required value={formData.city} onChange={e => updateField('city', e.target.value)} 
                 className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                 placeholder="Mumbai" />
             </div>
           </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
             <div>
                 <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Income Range</label>
                 <select value={formData.income_range} onChange={e => updateField('income_range', e.target.value)}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none">
                   <option>Below ₹20 thousand</option>
                   <option>₹20–50 thousand</option>
                   <option>₹50–75 thousand</option>
                   <option>₹75K–1 lakh</option>
                   <option>₹1 lakh+</option>
                 </select>
             </div>
             <div>
                 <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Capital Bucket</label>
                 <select value={formData.capital_bucket} onChange={e => updateField('capital_bucket', e.target.value)}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none">
                   <option>Below ₹10,000</option>
                   <option>₹10k–1 lakh</option>
                   <option>₹1–5 lakhs</option>
                   <option>₹5 lakhs+</option>
                 </select>
             </div>
             <div>
                 <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Experience Level</label>
                 <select value={formData.experience_level} onChange={e => updateField('experience_level', e.target.value)}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none">
                   <option>Beginner</option>
                   <option>Intermediate</option>
                   <option>Pro</option>
                 </select>
             </div>
             <div>
                 <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Trading Duration</label>
                 <select value={formData.trading_duration} onChange={e => updateField('trading_duration', e.target.value)}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-lg px-4 py-3 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none">
                   <option>Less than 6 months</option>
                   <option>6–24 months</option>
                   <option>2+ years</option>
                 </select>
             </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
           {step > 1 && (
             <button type="button" onClick={handleBack} className="px-4 py-3 rounded-lg border border-[var(--border-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
           )}
           
           {step < 3 ? (
             <button type="button" onClick={handleNext} className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
               Next <ArrowRight className="w-5 h-5" />
             </button>
           ) : (
             <button 
                type="button" 
                onClick={handleFinalSubmit} 
                disabled={loading} 
                className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Registration'}
             </button>
           )}
        </div>
      </form>

      <div className="text-center text-sm text-[var(--text-muted)]">
        Already have an account?{' '}
        <button onClick={() => setAuthView('login')} className="text-[var(--text-main)] font-medium hover:text-[var(--accent)] transition-colors">
          Log in
        </button>
      </div>
    </div>
  );
};