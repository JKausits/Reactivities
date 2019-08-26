import React from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <Menu fixed='top' inverted>
      <Container>
        <Menu.Item header as={NavLink} to='/'>
          <img src='/assets/logo.png' alt='logo' style={{ marginRight: 10 }} />
          Reactivites
        </Menu.Item>
        <Menu.Item name='Activities' as={NavLink} to='/activities' />
        <Menu.Item as={NavLink} to='/createActivity'>
          <Button positive content='Create Activity'></Button>
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default NavBar;
