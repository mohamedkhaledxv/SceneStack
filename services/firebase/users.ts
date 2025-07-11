import { auth, db } from '@/firebaseConfig';
import { UserMetadataInterface } from "@/types/user";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const setUserMetadata = async (data: Partial<UserMetadataInterface>) => {
  const user = auth.currentUser;

  if (!user) {
    console.error("No authenticated user found.");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  const metadata: UserMetadataInterface = {
    uid: user.uid,
    name: data.name || "Anonymous",
    gender: data.gender || "Prefer not to say",
    email: data.email || user.email || "",
    joinedAt: new Date(),
    favorites: [],
    watchHistory: [],
    preferences: {
      preferredGenres: data.preferences?.preferredGenres || [],
      language: data.preferences?.language || "en",
    },
    role: "user"
  };

  await setDoc(userRef, metadata, { merge: true });
};

export const getUserMetadata = async (): Promise<UserMetadataInterface | null> => {
  const user = auth.currentUser;

  if (!user) {
    console.log("No authenticated user found when fetching metadata.");
    return null;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      console.warn("User metadata document not found.");
      return null;
    }

    const data = docSnap.data();
    return data as UserMetadataInterface;
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    throw error;
  }
};
