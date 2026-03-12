import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Upload, User, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EditProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.photoBase64) {
          setPhotoBase64(data.photoBase64);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Update Auth Profile
      await updateProfile(user, {
        displayName: displayName,
        // We can't store base64 in photoURL due to size limits, so we store it in Firestore
        // We could set photoURL to null or a placeholder if we wanted
      });

      // Store in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        displayName: displayName,
        email: user.email,
        photoBase64: photoBase64,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
        <p className="text-slate-500">Update your personal information</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50">
                {photoBase64 ? (
                  <img src={photoBase64} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <Upload className="w-8 h-8" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-sm text-slate-500">Click to upload new picture</p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read Only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
