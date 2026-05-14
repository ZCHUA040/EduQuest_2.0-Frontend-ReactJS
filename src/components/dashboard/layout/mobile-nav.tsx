'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { navItems } from './config';
import { navIcons } from './nav-icons';
import {useUser} from "@/hooks/use-user";

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { eduquestUser } = useUser();

  const filteredNavItems = eduquestUser?.is_staff ? navItems : navItems
    .filter((item) => item.key !== 'import' && item.key !== 'eduquest-user' && item.key !== 'insights')
    .map((item) => {
      if (item.key === 'course' && item.items) {
        return { ...item, items: item.items.filter((child) => child.key === 'my-courses') };
      }

      if (item.key === 'quest' && item.items) {
        return { ...item, items: item.items.filter((child) => child.key === 'my-quests') };
      }

      return item;
    });

  return (
    <Drawer
      PaperProps={{
        sx: {
          '--MobileNav-background': 'var(--mui-palette-neutral-900)',
          '--MobileNav-color': 'var(--mui-palette-common-white)',
          '--NavItem-color': 'var(--mui-palette-neutral-300)',
          '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-common-white)',
          '--NavItem-active-color': 'var(--mui-palette-neutral-900)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
          '--NavItem-icon-active-color': 'var(--mui-palette-neutral-900)',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
          <Logo color="light" height={45} width={170} />
        </Box>
        {/*<Box*/}
        {/*  sx={{*/}
        {/*    alignItems: 'center',*/}
        {/*    backgroundColor: 'var(--mui-palette-neutral-900)',*/}
        {/*    border: '1px solid var(--mui-palette-neutral-700)',*/}
        {/*    borderRadius: '12px',*/}
        {/*    cursor: 'pointer',*/}
        {/*    display: 'flex',*/}
        {/*    p: '4px 12px',*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Box sx={{ flex: '1 1 auto' }}>*/}
        {/*    <Typography color="var(--mui-palette-neutral-400)" variant="body2">*/}
        {/*      Workspace*/}
        {/*    </Typography>*/}
        {/*    <Typography color="inherit" variant="subtitle1">*/}
        {/*      Devias*/}
        {/*    </Typography>*/}
        {/*  </Box>*/}
        {/*  <CaretUpDownIcon />*/}
        {/*</Box>*/}
      </Stack>
      {/*<Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />*/}
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: filteredNavItems })}
      </Box>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      {/*<Stack spacing={2} sx={{ p: '12px' }}>*/}
      {/*  <div>*/}
      {/*    <Typography color="var(--mui-palette-neutral-100)" variant="subtitle2">*/}
      {/*      Need more features?*/}
      {/*    </Typography>*/}
      {/*    <Typography color="var(--mui-palette-neutral-400)" variant="body2">*/}
      {/*      Check out our Pro solution template.*/}
      {/*    </Typography>*/}
      {/*  </div>*/}
      {/*  <Box sx={{ display: 'flex', justifyContent: 'center' }}>*/}
      {/*    <Box*/}
      {/*      component="img"*/}
      {/*      alt="Pro version"*/}
      {/*      src="/assets/devias-kit-pro.png"*/}
      {/*      sx={{ height: 'auto', width: '160px' }}*/}
      {/*    />*/}
      {/*  </Box>*/}
      {/*  <Button*/}
      {/*    component="a"*/}
      {/*    endIcon={<ArrowSquareUpRightIcon fontSize="var(--icon-fontSize-md)" />}*/}
      {/*    fullWidth*/}
      {/*    href="https://material-kit-pro-react.devias.io/"*/}
      {/*    sx={{ mt: 2 }}*/}
      {/*    target="_blank"*/}
      {/*    variant="contained"*/}
      {/*  >*/}
      {/*    Pro version*/}
      {/*  </Button>*/}
      {/*</Stack>*/}
    </Drawer>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem
      key={key}
      pathname={pathname}
      {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends NavItemConfig {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title, items }: NavItemProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;
  const router = useRouter();

  const handleClick = (): void => {
    if (items) {
      setOpen(!open);
    } else if (href) {
      // Navigate to the href
      router.push(href);
    }
  };

  return (
    <li>
      <Box
        {...(href
          ? {
            component: external ? 'a' : RouterLink,
            href,
            target: external ? '_blank' : undefined,
            rel: external ? 'noreferrer' : undefined,
          }
          : { role: 'button' })}
        onClick={handleClick}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          height: 48,
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',

          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
          }),
          '&:hover': {
            bgcolor: active ? 'var(--NavItem-active-background)' : 'var(--NavItem-hover-background)',
            color: active ? 'var(--NavItem-active-color)' : 'var(--NavItem-hover-color)',

          },
          '&::before': active ? {
            content: '" "',
            position: 'absolute',
            left: -18,
            height: 20,
            width: 3,
            borderRadius: 2,
            backgroundColor: active ? 'var(--NavItem-active-background)' : 'var(--NavItem-hover-background)',
            // display: active ? 'block' : 'none',
          } : {},
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
        {items ? <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
            {open ? (
              <CaretUpIcon color="var(--NavItem-color)" fontSize="var(--icon-fontSize-sm)" />
            ) : (
              <CaretDownIcon color="var(--NavItem-color)" fontSize="var(--icon-fontSize-sm)" />
            )}
          </Box> : null}
      </Box>
      {open && items ? <Box sx={{  borderLeftWidth: '1px',
          borderLeftStyle: 'solid',
          borderLeftColor: 'var(--NavItem-icon-color)',
          pl: 2, ml: '26px' }}>
          {renderNavItems({ items, pathname })}
        </Box> : null}
    </li>
  );
}
