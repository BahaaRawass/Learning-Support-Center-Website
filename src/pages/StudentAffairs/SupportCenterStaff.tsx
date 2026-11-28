import ErrorCard from "@/components/error-card";
import { FilterModal } from "@/components/FilterModal";
import LoadingCard from "@/components/loading-card";
import Modal from "@/components/Modal";
import NavigateToLogin from "@/components/NavigateToLogin";
import AddSemester from "@/components/Student Affairs/AddSemester";
import AddSupervisor from "@/components/Student Affairs/AddSupervisor";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SetErrorMessage } from "@/helper/errorhelpers";
import { formatDate } from "@/helper/functions";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types/users";
import { FilterIcon, LightbulbIcon, MoreHorizontalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { titleCase } from "title-case";

export default function SupportCenterStaff() {
  useDocumentTitle("Support Center Staff");

  const {
    Session,
    SignUp,
    DeleteUser,
    Loading: AuthLoading,
    Error: AuthError,
  } = useAuth();
  const {
    Users,
    AddUser,
    Loading: UsersLoading,
    Error: UsersError,
  } = useUsers(Session?.user);
  const {
    Departments,
    Loading: DepartmentsLoading,
    Error: DepartmentsError,
  } = useDepartments();

  const navigate = useNavigate();

  const [DeletedUser, setDeletedUser] = useState<User | null>(null);
  const [IsFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [SearchParams, setSearchParams] = useSearchParams();

  const IsFilterActive = useMemo(
    () => SearchParams.toString() !== "",
    [SearchParams],
  );

  const filteredUsers = useMemo<User[] | undefined>(
    () =>
      IsFilterActive
        ? Users?.filter((user) => {
            const nameFilter = SearchParams.get("name");
            const emailFilter = SearchParams.get("email");
            const roleFilter = SearchParams.get("role");
            const departmentFilter = SearchParams.get("department_id");
            const dateFilter = SearchParams.get("date");

            const selectedDate = dateFilter ? new Date(dateFilter) : null;
            const createdDate = user.created_at
              ? new Date(user.created_at)
              : null;
            const isDateMatch =
              !selectedDate ||
              !createdDate ||
              (createdDate.getFullYear() === selectedDate.getFullYear() &&
                createdDate.getMonth() === selectedDate.getMonth() &&
                createdDate.getDate() === selectedDate.getDate());

            return (
              (!nameFilter || user.display_name.includes(nameFilter)) &&
              (!emailFilter || user.email?.includes(emailFilter)) &&
              (!roleFilter || user.role === roleFilter) &&
              (!departmentFilter ||
                user.department_id === parseInt(departmentFilter)) &&
              isDateMatch
            );
          })
        : Users,
    [Users, SearchParams, IsFilterActive],
  );

  const loading = AuthLoading || UsersLoading || DepartmentsLoading;
  const error = AuthError || UsersError || DepartmentsError;
  const data = Users && Departments;

  if (error) {
    return <ErrorCard message={SetErrorMessage(error)} />;
  }

  if (loading) {
    return (
      <LoadingCard
        message={AuthLoading ? "Checking authentication" : "Loading data"}
      />
    );
  }

  if (!Session) {
    return <NavigateToLogin />;
  }

  if (
    Session.user.app_metadata.role !== "student_affairs" ||
    Session.user.is_anonymous
  )
    return (
      <ErrorCard
        message="You do not have permission to view this page."
        actionLabel="Go to Home"
        onAction={() => navigate("/")}
      />
    );

  if (!data) return <ErrorCard message="Failed to load required data." />;

  async function handleDelete(id: User["id"]) {
    const ok = await DeleteUser(id);

    if (!ok) {
      alert("Failed to remove user. Please try again.");
    }
  }

  function RowActions({
    user,
    menu_item,
  }: {
    user: User;
    menu_item: "context" | "dropdown";
  }) {
    const MenuItemElement =
      menu_item === "context" ? ContextMenuItem : DropdownMenuItem;

    return (
      <MenuItemElement
        variant="destructive"
        className="cursor-pointer text-[16px] text-primary"
        onClick={() => setDeletedUser(user)}
      >
        Remove
      </MenuItemElement>
    );
  }

  return (
    <>
      <h1 className="page-title">Support Center Staff</h1>
      <p className="page-desc">Overview of support center staff members.</p>

      <div className="flex flex-col gap-5">
        <AddSemester />
        <Separator />
        <AddSupervisor
          SignUp={SignUp}
          AddUser={AddUser}
          Departments={Departments}
          Users={filteredUsers ?? []}
        />
      </div>

      <div className="p-5 flex flex-col gap-4">
        <h2 className="text-xl text-(--navy) mb-4 font-serif font-semibold flex ">
          Active Supervisor Accounts
          <div className="flex gap-2 mt-2 ml-auto font-[georgia]">
            <Button
              className="text-lg btn-primary"
              onClick={() => setIsFilterOpen(true)}
            >
              <FilterIcon className="size-5!" /> Filter Records
            </Button>
          </div>
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center"></TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Department</TableHead>
              <TableHead className="text-center">Added At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers
                .filter((user) => user.role === "admin")
                .map((user, index) => {
                  return (
                    <ContextMenu key={user.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow>
                          <TableHead className="text-center">
                            {index + 1}
                          </TableHead>
                          <TableCell className="text-center">
                            {user.display_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-center">
                            {titleCase(
                              user.role === "admin" ? "supervisor" : user.role,
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {Departments.find(
                              (department) =>
                                department.id === user.department_id,
                            )?.name || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                className="cursor-pointer"
                              >
                                <Button variant="secondary">
                                  <MoreHorizontalIcon />
                                  <span className="sr-only">Open Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="center"
                                className="focus:bg-none w-full"
                              >
                                <RowActions user={user} menu_item="dropdown" />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>

                      <ContextMenuContent>
                        <RowActions user={user} menu_item="context" />
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-[17px]">
                  No Supervisors found. Check your filters or add new Supervisor
                  to see them here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600/50">
          <LightbulbIcon /> Tip: Right click (hold on mobile) or click the
          actions button on a row to view some quick actions.
        </div>
      </div>

      <Modal
        Open={DeletedUser !== null}
        setOpen={() => setDeletedUser(null)}
        text={DeletedUser?.display_name}
        IsDestructive
        handleDelete={async () => {
          if (!DeletedUser) return;
          return await handleDelete(DeletedUser.id);
        }}
      />

      <FilterModal
        mode="user"
        IsOpen={IsFilterOpen}
        setIsOpen={setIsFilterOpen}
        Departments={Departments}
        SearchParams={SearchParams}
        setSearchParams={setSearchParams}
      />
    </>
  );
}
