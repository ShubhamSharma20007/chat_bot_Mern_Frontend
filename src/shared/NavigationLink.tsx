import React from "react";
import { Link } from "react-router-dom";
type Props = {
  to: string;
  bg: string;
  text: string;
  textColor: string;
  onClick?: () => Promise<void>;
};
const NavigationLink = (props: Props) => {
  return (
    <Link
      className="px-4 py-2 rounded-md hover:shadow-md hover:scale-105 transition-all duration-300"
      to={props.to}
      style={{ background: props.bg, color: props.textColor }}
    >
      {props.text}
    </Link>
  );
};

export default NavigationLink;
