import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategorySelectType, DisplayStyle } from "@/types/booking";
import type { UpdaterFunction } from "@/types/types";
import { GridIcon, LayoutListIcon } from "lucide-react";
import { titleCase } from "title-case";

type BookingsFilterProps = {
  DisplayStyle: DisplayStyle;
  setDisplayStyle: UpdaterFunction<DisplayStyle>;
  CategorySelect: CategorySelectType;
  setCategorySelect: UpdaterFunction<CategorySelectType>;
  FilterValue: string;
  setFilterValue: UpdaterFunction<string>;
  Results: number;
};

export default function BookingsFilter({
  CategorySelect,
  DisplayStyle,
  FilterValue,
  Results,
  setCategorySelect,
  setDisplayStyle,
  setFilterValue,
}: BookingsFilterProps) {
  function GetPlaceholderText() {
    switch (CategorySelect) {
      case "name":
        return "Filter bookings by name";
      case "id":
        return "Filter bookings by RHU ID";
      case "email":
        return "Filter bookings by email";
      case "courses":
        return "Filter bookings by courses";
    }
  }

  function GetInputType() {
    switch (CategorySelect) {
      case "name":
      case "courses":
        return "text";
      case "id":
        return "number";
      case "email":
        return "email";
    }
  }

  return (
    <div className="flex justify-center items-center gap-5 mb-5">
      <InputGroup>
        {CategorySelect === "status" ? (
          <Combobox items={["All", "WAITING", "ACCEPTED", "REJECTED"]}>
            <ComboboxInput
              className="w-[85%] border-none! ring-0! focus:ring-0! outline-none!"
              placeholder="Filter bookings by status"
              value={FilterValue}
              onChange={(event) => setFilterValue(event.target.value)}
            />
            <ComboboxContent>
              <ComboboxEmpty>No status exists for {FilterValue}</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem
                    key={item}
                    value={item}
                    onClick={() => setFilterValue(item === "All" ? "" : item)}
                  >
                    {titleCase(item)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ) : (
          <InputGroupInput
            type={GetInputType()}
            value={FilterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            placeholder={GetPlaceholderText()}
          />
        )}
        <InputGroupAddon>
          <Select
            defaultValue="name"
            value={CategorySelect}
            onValueChange={(value: CategorySelectType) =>
              setCategorySelect(value)
            }
          >
            <SelectTrigger className="border-none ring-0! outline-none!">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="name">Name: </SelectItem>
                <SelectItem value="email">Email: </SelectItem>
                <SelectItem value="id">RHU ID: </SelectItem>
                <SelectItem value="courses">Courses: </SelectItem>
                <SelectItem value="status">Status: </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">{Results} results</InputGroupAddon>
      </InputGroup>
      <ButtonGroup>
        <Button
          variant={DisplayStyle === "grid" ? "default" : "outline"}
          className={`${DisplayStyle === "grid" ? "btn-primary text-white" : ""}`}
          onClick={() => setDisplayStyle("grid")}
        >
          <GridIcon />
        </Button>
        <Button
          variant={DisplayStyle === "list" ? "default" : "outline"}
          className={`${DisplayStyle === "list" ? "btn-primary text-white" : ""} `}
          onClick={() => setDisplayStyle("list")}
        >
          <LayoutListIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
