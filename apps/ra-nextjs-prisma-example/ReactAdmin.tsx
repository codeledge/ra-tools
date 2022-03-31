import { Admin, Resource } from "react-admin";
import { dataProvider } from "ra-data-simple-prisma";
import { UserCreate, UserList } from "./resources/User";
import { PostList } from "./resources/Post";

const ReactAdmin = () => {
  return (
    <Admin dataProvider={dataProvider("/api")} disableTelemetry>
      <Resource name="user" list={UserList} create={UserCreate} />
      <Resource name="post" list={PostList} />
    </Admin>
  );
};

export default ReactAdmin;
