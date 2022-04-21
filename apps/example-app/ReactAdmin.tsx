import { Admin, Resource } from "react-admin";
import { dataProvider } from "ra-data-simple-prisma";
import { UserCreate, UserList, UserShow } from "./resources/User";
import { PostCreate, PostList } from "./resources/Post";
import { TagCreate, TagList } from "./resources/Tag";

const ReactAdmin = () => {
  return (
    <Admin dataProvider={dataProvider("/api")} disableTelemetry>
      <Resource
        name="user"
        list={UserList}
        create={UserCreate}
        show={UserShow}
      />
      <Resource name="post" list={PostList} create={PostCreate} />
      <Resource name="tag" list={TagList} create={TagCreate} />
    </Admin>
  );
};

export default ReactAdmin;
