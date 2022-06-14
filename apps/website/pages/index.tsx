import { GetServerSideProps, NextPage } from "next/types";
import { Post } from "@prisma/client";
import prismaClient from "db";

const HomePage: NextPage<{ posts: Post[] }> = ({ posts }) => {
  return (
    <>
      <h1>Welcome to the website</h1>
      <h2>There a currently {posts.length} posts</h2>
      {posts?.map((post) => (
        <p key={post.id}>{post.text}</p>
      ))}
    </>
  );
};

export default HomePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const posts = await prismaClient.post.findMany();

  return {
    props: {
      posts,
    },
  };
};
