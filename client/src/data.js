import Thumbnail1 from "./images/blog1.jpg";
import Thumbnail2 from "./images/blog2.jpg";
import Thumbnail3 from "./images/blog3.jpg";
import Thumbnail4 from "./images/blog4.jpg";
import Avatar1 from "./images/avatar1.jpg";
import Avatar2 from "./images/avatar2.jpg";
import Avatar3 from "./images/avatar3.jpg";
import Avatar4 from "./images/avatar4.jpg";
import Avatar5 from "./images/avatar5.jpg";

export const DUMMY_POSTS = [
  {
    id: "1",
    thumbnail: Thumbnail1,
    category: "education",
    title: "This is the title of the very first post on this blog",
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    authorID: 3,
  },
  {
    id: "2",
    thumbnail: Thumbnail2,
    category: "science",
    title: "This is the title of the very first post on this blog 2",
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    authorID: 1,
  },
  {
    id: "3",
    thumbnail: Thumbnail3,
    category: "business",
    title: "This is the title of the very first post on this blog 3",
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    authorID: 13,
  },
  {
    id: "4",
    thumbnail: Thumbnail4,
    category: "space",
    title: "This is the title of the very first post on this blog 4",
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    authorID: 11,
  },
];

export const authorsData = [
  { id: 1, avatar: Avatar1, name: "Ernest Achever", posts: 3 },
  { id: 2, avatar: Avatar2, name: "Ernest Achever", posts: 3 },
  { id: 3, avatar: Avatar3, name: "Ernest Achever", posts: 3 },
  { id: 4, avatar: Avatar4, name: "Ernest Achever", posts: 3 },
  { id: 5, avatar: Avatar5, name: "Ernest Achever", posts: 3 },
];
