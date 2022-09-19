import React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/system/Container";
import Typography from "@mui/material/Typography";
import logo from "../asserts/images/MF-LOGO.png";
import "./layout.css";


export default function MiniDrawer(props) {
  const currentYear = new Date().getFullYear();
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ backgroundColor: "#fff", color: "#047d91", ml: 0 }}
      >
        <Toolbar sx={{ml: 0}}>
          <Box mr={3} sx={{background: '#fff'}}>
            <img
              src={logo}
              alt="logo"
              style={{ height: "55px", width: "135px" }}
            />
          </Box>
          <Typography variant="h6" color={"#000"}> Code Optimization Tool </Typography>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          ></Typography>
        </Toolbar>
      </AppBar>
      <Box className="footer">
        <Typography component={'span'}>&copy; {currentYear} Mindfields.</Typography>
        <Typography component={'span'} ml={1}>All Rights Reserved.</Typography>
        <Typography component={'span'} ml={1}>COT V2.2.6</Typography>
      </Box>
      <Container maxWidth="xl">
        {props.children}
      </Container>
    </Box>
  );
}
