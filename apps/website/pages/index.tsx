import { Post } from "@prisma/webClient";
import { GetServerSideProps, NextPage } from "next/types";
import { prismaWebClient } from "../prisma/prismaWebClient";

const HomePage: NextPage<{ posts: Post[] }> = ({ posts }) => {
  return (
    <>
      <h1>Home</h1>
      <h2>Posts</h2>
      {posts?.map((post) => (
        <p key={post.id}>{post.text}</p>
      ))}
    </>
  );
};

export default HomePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const posts = await prismaWebClient.post.findMany();

  return {
    props: {
      posts,
    },
  };
};
