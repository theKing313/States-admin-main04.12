'use client'
import { AppShell, Burger, Flex, NavLink, NavLinkProps, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// const NavNextLink = (props:any) => <NavLink component={Link} {...props}/> //nice try, but fuck types

const navLinkEditList = [
  {
    label: 'Приветственный экран',
    href: '/edit/hero',
  },
  {
    label: 'Краткая информация',
    href: '/edit/twoSides',
  },
  {
    label: 'Список карточек',
    href: '/edit/magazinesScroll',
  },
  {
    label: 'Бегущая строка',
    href: '/edit/sponsors',
  },
  {
    label: 'Видео плеер',
    href: '/edit/videoPlayer',
  },
  {
    label: 'Добавить Обьекты',
    href: '/edit/galary',
  },
  {
    label: 'Регионы',
    href: '/edit/regions',
  },

  {
    label: 'Контакты',
    href: '/edit/contact',
  },
  {
    label: 'Футер',
    href: '/edit/footer',
  },
] as const

function AppWrapper({ children }: { children: ReactNode }) {
  const [opened, { toggle }] = useDisclosure()
  const pathname = usePathname()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding='md'>
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
        <Title p={10} order={3}>
          <Flex gap='xs' justify='flex-start' align='center' direction='row'>
            <IconPencil /> Панель управления контентом
          </Flex>
        </Title>
        {/* <div>Logo</div> */}
      </AppShell.Header>

      <AppShell.Navbar p='md'>
        {/* Меню */}
        <NavLink component={Link} label={'Главная страница'} href={'/'} active={pathname === '/'}></NavLink>
        <NavLink
          component={Link}
          href='/edit'
          childrenOffset={28}
          label='Редактирование блоков'
          //   leftSection={<IconActivity size='1rem' stroke={1.5} />}
          // rightSection={<IconChevronRight size='0.8rem' stroke={1.5} />}
          defaultOpened
          variant='filled'
          active={pathname === '/edit'}>
          {navLinkEditList.map((elem, i) => {
            return (
              <NavLink
                key={elem.href + i}
                component={Link}
                label={elem.label}
                href={elem.href}
                active={pathname === elem.href}
              />
            )
          })}
        </NavLink>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
      {/* style={{ minHeight: '100%' }} */}
    </AppShell>
  )
}

export { AppWrapper }
