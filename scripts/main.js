import { auth, db } from "./firebase.js";
import { collection, serverTimestamp, query, where, getDocs, getDoc, orderBy, doc, addDoc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js"

const lib = {
  title: "The Paddington Bear",
  author: "J.K.Rowling",
  pages: 214,
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Mi condimentum proin mi rutrum. 
  Netus volutpat, aliquet proin porta cursus eu eu. 
  Enim amet, est at quis pellentesque morbi.`,
  completed: true,
};

class Book {
  title;
  author;
  pages;
  description;
  completed;

  constructor(title, author, pages, description, completed) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.description = description;
    this.completed = completed;
  }
}

class Library {
  constructor() {
    this.books = [];
  }
  isInLibrary = (newBook) => {
    return this.books.some((book) => book.title === newBook.title);
  }
  getBook = (title) => {
    return this.books.find((book) => book.title === title);
  }
  addBook = (newBook) => {
    if (!this.isInLibrary(newBook)) {
      this.books.push(newBook);
    }
  }
  removeBook = (title) => {
    this.books = this.books.filter((book) => book.title !== title);
  }

}

const library = new Library();

const openModalButton = document.querySelector(".add-button");
const closeModalButton = document.querySelector('.overlay');
const booksContainer = document.querySelector('.books-container');
const backToTopButton = document.querySelector(".top-button");
const addBookFormContainer = document.querySelector('.add-modal-container');
const addBookForm = document.querySelector('.add-modal');
const addBookButton = document.querySelector('.add-modal-button');
const dropDownButton = document.querySelector('.dropDown-button');
const dropDownContent = document.querySelector('.dropdown-content');

dropDownButton.addEventListener('click', () => {
  dropDownContent.classList.toggle('show');
})

window.onclick = (e) => {
  if (e.target.classList.contains('dropDown-button') === false) {
    if (dropDownContent.classList.contains('show') === true) {
      dropDownContent.classList.remove('show');
    }
  }
}


const openModal = () => {
  console.log('Modal is open');
  const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
  const body = document.body;
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}`;
  closeModalButton.style.display = 'block';
  addBookFormContainer.classList.add('active');
  addBookForm.reset();
}

const closeModal = () => {
  console.log('Modal is closed');
  const body = document.body;
  const scrollY = body.style.top;
  body.style.position = '';
  body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  addBookFormContainer.classList.remove('active');
  closeModalButton.style.display = 'none';
}

window.addEventListener('scroll', () => {
  document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
  if (window.scrollY > 20) {
    backToTopButton.classList.add('active');

  }
  else {
    backToTopButton.classList.remove('active');
  }
});

const createBookCard = (book) => {
  const bookCard = document.createElement('div');
  const bookCardButtonContainer = document.createElement('div');
  const completedButton = document.createElement('button');
  const removeButton = document.createElement('button');

  bookCard.classList.add('book');
  bookCardButtonContainer.classList.add('book-button-container');
  completedButton.classList.add("completed-button");
  completedButton.setAttribute('id', `${book.title}`);
  removeButton.classList.add("remove-button");
  removeButton.setAttribute('id', `${book.title}`);

  bookCard.innerHTML =
    ` <h2 class="title">${book.title}</h2>
    <div>
      <div class="subtext">
        <p class="pages">${book.pages} pages</p>
        <p class="author"> · by ${book.author}</p>
      </div>
      <p class="description">${book.description}</p>
    </div>
  `;

  completedButton.innerHTML = `
    ${book.completed ? 'You have read this' : 'You have not read this'}
  `;
  removeButton.innerHTML = `
    Remove
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  `;

  removeButton.onclick = removeBook;
  completedButton.onclick = toggleComplete;

  bookCardButtonContainer.appendChild(completedButton);
  bookCardButtonContainer.appendChild(removeButton);
  bookCard.appendChild(bookCardButtonContainer);
  booksContainer.appendChild(bookCard);
}

const updateBooksContainer = () => {
  booksContainer.innerHTML = '';
  for (let book of library.books) {
    createBookCard(book);
  }
  updateBanner();
}

const getBookFormInput = () => {
  const title = document.querySelector('.add-modal-input1').value;
  const author = document.querySelector('.add-modal-input2').value;
  const pages = document.querySelector('.add-modal-input3').value;
  const description = document.querySelector('.add-modal-input4').value;
  const completed = document.querySelector('.completed-modal-checkbox').checked;
  return new Book(title, author, pages, description, completed);
}

const addBook = (e) => {
  e.preventDefault();
  const newBook = getBookFormInput();

  if (library.isInLibrary(newBook)) {
    alert('This book already exists in your library');
    return
  }
  if (auth.currentUser) {
    addBookDB(newBook);
  }
  else {
    library.addBook(newBook);
    updateBooksContainer();
    saveLocal();

  }
  console.log('Book has been added.');
  closeModal();
}

const removeBook = (e) => {
  const bookTitle = e.target.id;
  if (auth.currentUser) {
    removeBookDB(bookTitle);
  }
  else {
    library.removeBook(bookTitle);
    updateBooksContainer();
    saveLocal();

  }
  console.log('Book has been removed');
}

const toggleComplete = (e) => {
  const title = e.target.id;
  const book = library.getBook(title);
  if (auth.currentUser) {
    toggleBookIsReadDB(book);
  } else {
    book.completed = !book.completed;
    updateBooksContainer();
    saveLocal();

  }
  console.log('toggleComplete successful');
}

const getTotalBooks = () => {
  return library.books.length;
}

const getTotalCompleted = () => {
  let count = 0;
  for (let book of library.books) {
    if (book.completed === true) {
      count++;
    }
  }
  return count;
}

const getTotalIncomplete = () => {
  let count = 0;
  for (let book of library.books) {
    if (book.completed === false) {
      count++;
    }
  }
  return count;
}

const getTotalPagesCompleted = () => {
  let count = 0;
  for (let book of library.books) {
    if (book.completed === true) {
      count += parseInt(book.pages);
    }
  }
  return count;
}

const updateBanner = () => {
  const totalBooks = getTotalBooks();
  const totalCompleted = getTotalCompleted();
  const totalIncomplete = getTotalIncomplete();
  const totalPagesCompleted = parseInt(getTotalPagesCompleted());

  document.querySelector('.banner1').firstElementChild.innerHTML = `The Total Amount of Books: ${totalBooks}`;
  document.querySelector('.banner2').firstElementChild.innerHTML = `Amount of Books Completed: ${totalCompleted}`;
  document.querySelector('.banner3').firstElementChild.innerHTML = `Amount of Books to Read: ${totalIncomplete}`;
  document.querySelector('.banner4').firstElementChild.innerHTML = `Total Amount of Pages Completed: ${totalPagesCompleted}`;
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behaviour: 'smooth',
  });
}
openModalButton.addEventListener('click', openModal);

closeModalButton.addEventListener('click', closeModal);

addBookForm.onsubmit = addBook;

backToTopButton.onclick = scrollToTop;

window.onload = async (event) => {
  updateBooksContainer();
  console.log('window has loaded');
  console.log(auth);
};

//storage

const JSONToBook = (book) => {
  return new Book(book.title, book.author, book.pages, book.description, book.completed);
}

const saveLocal = () => {
  localStorage.setItem('library', JSON.stringify(library.books));
}

const restoreLocal = () => {
  const books = JSON.parse(localStorage.getItem('library'));
  if (books) {
    library.books = books.map((book) => JSONToBook(book));
    updateBooksContainer();
  }
  else {
    library.books = [];
  }
}

//firestore

// //auth
// const signUpUser = () => {
//   let email = document.querySelector('#email').value;
//   let password = document.querySelector('#password').value;
// }

//firestore db

const setupRealTimeListener = async () => {
  // unsubscribe = db
  //   .collection('books')
  //   .where('uuid', '==', auth.currentUser.uid)
  //   .orderBy('createdAt')
  //   .onSnapshot((snapshot) => {
  //     library.books = docsToBooks(snapshot.docs)
  //     updateBooksContainer()
  //   })

  const q = query(collection(db, 'books'), where('uuid', '==', auth.currentUser.uid), orderBy('createdAt'));
  const unsubscribe = await onSnapshot(q, (querySnapshot) => {
    library.books = docsToBooks(querySnapshot.docs);
    updateBooksContainer();
  },
    (e) => console.log(e)
  )

}

const docsToBooks = (docs) => {
  return docs.map((doc) => {
    return new Book(
      doc.data().title,
      doc.data().author,
      doc.data().pages,
      doc.data().description,
      doc.data().completed
    )
  })
}

const bookToDoc = (book) => {
  return {
    uuid: auth.currentUser.uid,
    title: book.title,
    author: book.author,
    pages: book.pages,
    description: book.description,
    completed: book.completed,
    createdAt: serverTimestamp(),
  }
}

const addBookDB = async (newBook) => {
  // db.collection('books').add(bookToDoc(newBook))
  try {
    const newDoc = await addDoc(collection(db, 'books'), bookToDoc(newBook));
  } catch (e) {
    console.log(e)
  }
}

const removeBookDB = async (title) => {
  // db.collection('books')
  //   .doc(await getBookIdDB(title))
  //   .delete()

  try {
    const id = await getBookIdDB(title);
    await deleteDoc(doc(db, 'books', id));
  } catch (e) {
    console.log(e)
  }
}

const toggleBookIsReadDB = async (book) => {
  // db.collection('books')
  //   .doc(await getBookIdDB(book.title))
  //   .update({ completed: !book.completed })
  try {
    const id = await getBookIdDB(book.title);
    await updateDoc(doc(db, 'books', id), { 'completed': !book.completed });
  } catch (e) {
    console.log(e);
  }
}

const getBookIdDB = async (title) => {
  // const snapshot = await db
  //   .collection('books')
  //   .where('ownerId', '==', auth.currentUser.uid)
  //   .where('title', '==', title)
  //   .get()


  try {
    const q = query(collection(db, 'books'), where('uuid', '==', auth.currentUser.uid), where('title', '==', title));
    const snapshot = await getDocs(q);
    const bookId = snapshot.docs.map((doc) => doc.id).join('');
    return bookId
  } catch (e) {
    console.log(e)
  }
}

export { setupRealTimeListener }