import { TextField } from "@mui/material";
type Props = {
  name: string;
  type: string;
  label: string;
};
export const CustomizeInputs = (props: Props) => {
  return (
    <TextField

      className="w-full place placeholder:text-black"
      label={props.label}
      InputLabelProps={{
        style: {
          color: "black",
        },
      }}
      name={props.name}
      type={props.type}
      size="small"
      variant="outlined"
      color="primary"
      placeholder={props.label}
    />
  );
};
