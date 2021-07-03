import firebaseApp from './initializeApp-fileBase';
import { getAuth } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getFirestore,
  onSnapshot,
  where,
  query,
} from 'firebase/firestore';

import { renderLibraryMovies } from './render-library-movies';

const db = getFirestore();
const auth = getAuth();

function getUser() {
  const user = auth.currentUser;

  if (user) {
    return user.uid;
  } else {
    console.log('No user is signed in.');
  }
}

async function getLibraryMovies(libraryType) {
  const currentUserUid = getUser();

  const docRef = doc(db, libraryType, currentUserUid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().movieId;
  } else {
    console.log('No movies yet...');
  }
}

async function addMoviesToLibrary(libraryType, movieId) {
  const currentUserUid = getUser();
  const docRef = doc(db, libraryType, currentUserUid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      movieId: arrayUnion(movieId),
    });
  } else {
    await setDoc(docRef, {
      movieId: [movieId],
    });
  }
}

async function removeMoviesFromLibrary(libraryType, movieId) {
  const currentUserUid = getUser();
  const docRef = doc(db, libraryType, currentUserUid);
  await updateDoc(docRef, {
    movieId: arrayRemove(movieId),
  });
}

function onQueueButton(e) {
  const movieId = e.target.id;
  const libraryType = 'queue';
  const updatedBtn = e.target;
  getLibraryMovies(libraryType).then(watchedMovies => {
    if (!watchedMovies.includes(String(movieId))) {
      updateBtnTextContent(updatedBtn, watchedMovies, movieId, libraryType);
      addMoviesToLibrary(libraryType, movieId);
    } else {
      updateBtnTextContent(updatedBtn, watchedMovies, movieId, libraryType);
      removeMoviesFromLibrary(libraryType, movieId);
    }
  });
}

function updateBtnTextContent(updatedBtn, watchedMovies, movieId, libraryType) {
  if (!watchedMovies.includes(String(movieId))) {
    updatedBtn.textContent = `Remove from ${libraryType}`;
    updatedBtn.classList.add('active');
  } else {
    updatedBtn.textContent = `Add to ${libraryType}`;
    updatedBtn.classList.remove('active');
  }
}

function checkBtnTextContent(updatedBtn, movieId, libraryType) {
  getLibraryMovies(libraryType).then(watchedMovies => {
    if (watchedMovies.includes(String(movieId))) {
      updatedBtn.textContent = `Remove from ${libraryType}`;
      updatedBtn.classList.add('active');
    } else {
      updatedBtn.textContent = `Add to ${libraryType}`;
      updatedBtn.classList.remove('active');
    }
  });
}

function onWatchedButton(e) {
  const movieId = e.target.id;
  const libraryType = 'watched';
  const updatedBtn = e.target;
  getLibraryMovies(libraryType).then(watchedMovies => {
    if (!watchedMovies.includes(String(movieId))) {
      updateBtnTextContent(updatedBtn, watchedMovies, movieId, libraryType);
      addMoviesToLibrary(libraryType, movieId);
    } else {
      updateBtnTextContent(updatedBtn, watchedMovies, movieId, libraryType);
      removeMoviesFromLibrary(libraryType, movieId);
    }
  });
}

export {
  onWatchedButton,
  onQueueButton,
  getLibraryMovies,
  updateBtnTextContent,
  checkBtnTextContent,
};
