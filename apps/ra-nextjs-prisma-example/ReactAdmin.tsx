import { Admin, Resource } from "react-admin";
import { UserCreate, UserEdit, UserList, UserShow } from "./resources/User";

import { PostList } from "./resources/Post";
import { dataProvider } from "ra-data-simple-prisma";

const ReactAdmin = () => {
  return (
    <Admin dataProvider={dataProvider("/api")} disableTelemetry>
      <Resource
        name="user"
        list={UserList}
        create={UserCreate}
        edit={UserEdit}
        show={UserShow}
      />
      <Resource name="post" list={PostList} />
    </Admin>
  );
};

export default ReactAdmin;
