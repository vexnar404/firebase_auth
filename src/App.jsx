import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';

const Container = ({ children }) => (
  <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-indigo-100 via-white to-peach-100">
    <div className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-[2rem] shadow-2xl shadow-gray-100 border border-gray-100 transform transition-all duration-300 hover:shadow-gray-200">
      {children}
    </div>
  </div>
);

const InputStyle = "w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-violet-100 focus:border-violet-300 outline-none transition duration-150 text-gray-800 placeholder-gray-400 text-base sm:text-lg";

const PrimaryButtonStyle = "w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold py-4 rounded-xl transition duration-200 transform hover:-translate-y-0.5 shadow-md shadow-violet-100 active:translate-y-0 active:shadow-inner text-base sm:text-lg";

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  useEffect(() => {
    if (!userToken && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          setIsRecaptchaVerified(true);
        },
        'expired-callback': () => {
          setIsRecaptchaVerified(false);
        }
      });
      window.recaptchaVerifier.render();
    }
  }, [userToken]);

  const requestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isRecaptchaVerified) {
      setError('Please check the "I\'m not a robot" box first.');
      setLoading(false);
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      setError('Please include the country code (e.g., +91)');
      setLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();
      localStorage.setItem('userToken', token);
      setUserToken(token);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Invalid OTP.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('userToken');
    setUserToken('');
    setConfirmationResult(null);
    setPhoneNumber('');
    setOtp('');
    setIsRecaptchaVerified(false);

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  if (userToken) {
    return (
      <Container>
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Success</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 font-medium">Authentication complete.</p>

          <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl break-all text-xs sm:text-sm text-gray-600 mb-8 sm:mb-10 border border-gray-100 text-left font-mono relative">
            <span className="absolute -top-3 left-4 bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-500 rounded-full border border-gray-100">Token</span>
            {userToken.substring(0, 100)}...
          </div>

          <button onClick={handleLogout} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-4 px-4 rounded-xl transition duration-200 text-base sm:text-lg">
            Log Out
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-violet-100 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-violet-200 mx-auto sm:mx-0">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-center sm:text-left">Sign In</h2>
      <p className="text-base sm:text-lg text-gray-500 mb-8 sm:mb-10 font-medium text-center sm:text-left">Verify your phone number.</p>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 mb-6 sm:mb-8 rounded-xl flex items-center gap-3">
          <svg className="w-6 h-6 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-rose-700 text-sm sm:text-base font-medium">{error}</p>
        </div>
      )}

      {!confirmationResult ? (
        <form onSubmit={requestOTP} className="space-y-5 sm:space-y-6">
          <div className="relative">
            <label className="block text-sm sm:text-base font-semibold text-gray-600 mb-2 ml-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className={`${InputStyle} pl-12 sm:pl-14`}
              required
            />
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 absolute left-4 sm:left-5 bottom-4 sm:bottom-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>

          <div id="recaptcha-container" className="flex justify-center sm:justify-start"></div>

          <button type="submit" disabled={loading} className={`${PrimaryButtonStyle}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOTP} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-600 mb-2 ml-1 text-center">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className={`${InputStyle} text-center text-3xl sm:text-4xl font-bold tracking-[.3em] sm:tracking-[.5em] focus:ring-green-100 focus:border-green-300`}
              required
              maxLength={6}
            />
          </div>
          <button type="submit" disabled={loading} className={`${PrimaryButtonStyle} !bg-green-600 hover:!bg-green-700 disabled:!bg-green-300 shadow-green-100`}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <div className="text-center mt-4 sm:mt-5">
            <button type="button" onClick={() => setConfirmationResult(null)} className="text-sm sm:text-base font-semibold text-gray-500 hover:text-violet-600 transition">
              Back
            </button>
          </div>
        </form>
      )}
    </Container>
  );
}

export default App;