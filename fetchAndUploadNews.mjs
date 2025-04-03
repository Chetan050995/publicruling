import fetch from "node-fetch";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain",
  projectId: "your-project-id",
  storageBucket: "your-bucket",
  messagingSenderId: "sender-id",
  appId: "app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NEWS_API_KEY = "d838df9b0366417bbe99979e46872be5";
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=in&pageSize=20&apiKey=${NEWS_API_KEY}`;

const autoAssignCategory = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("india") || text.includes("modi") || text.includes("parliament")) return "national";
  if (text.includes("ukraine") || text.includes("global") || text.includes("biden")) return "global";
  if (text.includes("uttar pradesh") || text.includes("delhi") || text.includes("state")) return "state";
  if (text.includes("agra") || text.includes("mathura") || text.includes("district")) return "district";
  return "national";
};

const fetchAndUploadNews = async () => {
  try {
    const response = await fetch(NEWS_API_URL);
    const data = await response.json();

    for (const article of data.articles) {
      const { title, urlToImage, description } = article;
      const category = autoAssignCategory(title, description);

      const topicData = {
        title,
        imageUrl: urlToImage || "",
        category,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "topics"), topicData);
    }

    console.log("News topics uploaded successfully.");
  } catch (error) {
    console.error("Error uploading news:", error);
  }
};

fetchAndUploadNews();