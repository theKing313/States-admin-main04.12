'use client'
import api from '@/app/api'
import { Notification, Button, Center, Flex, Paper, PasswordInput, TextInput, Affix } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { Dispatch, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuth, setIsAuth] = useState(true)

  useEffect(() => {
    function logout() {
      setIsAuth(false)
      localStorage.removeItem('session')
      api.currentAccount = null
    }

    const localStorageSession = JSON.parse(localStorage.getItem('session') || 'false')
    if (localStorageSession) {
      api.currentAccount = localStorageSession
      if (new Date(localStorageSession.expire || 0).getTime() < new Date().getTime()) logout()
    }

    api.checkIsAuth(logout)
  }, [])

  return <>{isAuth ? children : <Login setIsAuth={setIsAuth} />}</>
}

interface FormValues {
  email: string
  password: string
}

interface LoginProps {
  setIsAuth: Dispatch<boolean>
}

const Login = ({ setIsAuth }: LoginProps) => {
  const {
    mutate: login,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: (values: FormValues) => api.createSession(values.email, values.password),
    onSuccess: (response) => {
      localStorage.setItem('session', JSON.stringify(response))
      setIsAuth(true)
    },
  })

  const form = useForm<FormValues>({
    initialValues:
      process.env.NODE_ENV === 'development'
        ? { email: 'superadmin@example.com', password: 'superadmin' }
        : { email: '', password: '' },
  })

  return (
    <Center w={'100%'} h={'100%'} bg='var(--mantine-color-gray-light)'>
      <Paper
        name='loginForm'
        component='form'
        w={'30%'}
        h={'40%'}
        shadow='md'
        withBorder
        p='xl'
        onSubmit={form.onSubmit((values) => login(values))}>
        <Flex h={'100%'} w={'100%'} direction={'column'} justify={'space-around'} gap={'md'}>
          <TextInput name='email' placeholder='Логин (адрес)' required {...form.getInputProps('email')} />
          <PasswordInput name='password' placeholder='Пароль' required {...form.getInputProps('password')} />
          <Button type='submit' variant='default' loading={isLoading}>
            Войти
          </Button>
        </Flex>
      </Paper>
      {error instanceof Error && (
        <Affix position={{ bottom: 25, right: 25 }} p={30}>
          <Notification
            withBorder
            withCloseButton={false}
            title='Ошибка'
            icon={<IconX />}
            variant='filled'
            color='red'
            style={{ visibility: isError ? 'visible' : 'hidden' }}>
            {error.message.includes('Invalid') ? 'Данный пользователь не найден.' : `Попробуйте еще раз.`}
          </Notification>
        </Affix>
      )}
    </Center>
  )
}

export { AuthProvider }
