import {
  Admin,
  CustomRoutes,
  Datagrid,
  List,
  Resource,
  TextField,
} from "react-admin";
import { PostCreate, PostEdit, PostList } from "./resources/Post";
import { TagCreate, TagList } from "./resources/Tag";
import { UserCreate, UserEdit, UserList, UserShow } from "./resources/User";
import { AdminCreate, AdminList, AdminShow } from "./resources/Admin";
import { useSession } from "next-auth/react";
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";
import LoginPage from "./custom-pages/LoginPage";
import {
  CategoryList,
  CategoryCreate,
  CategoryEdit,
} from "./resources/Category";
import { AuditList } from "./resources/Audit";
import { Prisma } from "@prisma/client";
import { Route } from "react-router";
import InfoPage from "./custom-pages/InfoPage";
import { UserResource } from "./UserResource";
import { models } from "./generate/models";
import { GenerateEdit } from "./generate/GenerateEdit";
import { GenerateShow } from "./generate/GenerateShow";
import { GenerateList } from "./generate/GenerateList";

const ReactAdmin = () => {
  const { data: session, status } = useSession();
  const tables = Object.keys(Prisma.ModelName);

  if (status === "loading") return <p>loading</p>;

  return (
    <Admin
      authProvider={authProvider(session)}
      dataProvider={dataProvider}
      disableTelemetry
      loginPage={LoginPage}
    >
      <CustomRoutes>
        <Route path="/info" element={<InfoPage />} />
      </CustomRoutes>
      <>
        {models.map(
          (table) =>
            table.fields[0].name === "id" && (
              <Resource
                key={table.name}
                name={table.name}
                list={<GenerateList model={table as any} />}
                show={<GenerateShow model={table as any} />}
                edit={<GenerateEdit model={table as any} />}
              />
            )
        )}
      </>
      <Resource
        name="post"
        list={PostList}
        create={PostCreate}
        edit={PostEdit}
      />
      <Resource name="tag" list={TagList} create={TagCreate} />
      <Resource
        name="admin"
        list={AdminList}
        create={AdminCreate}
        show={AdminShow}
      />
      <Resource
        name="category"
        list={CategoryList}
        create={CategoryCreate}
        edit={CategoryEdit}
      />
      <Resource name="audit" list={AuditList} />
    </Admin>
  );
};

export default ReactAdmin;
