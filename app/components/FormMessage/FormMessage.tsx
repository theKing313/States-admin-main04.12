import { Alert } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

interface FormMessageProps {
  title?: string
  type: 'error' | 'success'
  message: string
  isVisibile: boolean
  props?: {}
  icon?: JSX.Element
}

function FormMessage({
  title = 'Ошибка',
  type,
  isVisibile,
  message,
  props = {},
  icon = <IconInfoCircle />,
}: FormMessageProps) {
  return (
    <Alert
      style={{ visibility: isVisibile ? 'visible' : 'hidden' }}
      variant='light'
      color={type === 'error' ? 'red' : 'green'}
      title={title}
      icon={icon}
      {...props}>
      {message}
    </Alert>
  )
}

type FormMessageOptionalProps = Partial<FormMessageProps>

FormMessage.Success = ({
  title = 'Успех',
  type = 'success',
  isVisibile = true,
  message = 'Блок успешно изменен',
  props,
  icon = <IconInfoCircle />,
}: FormMessageOptionalProps) => {
  return (
    <FormMessage
      title={title}
      type={type}
      isVisibile={isVisibile}
      message={message}
      props={props}
      icon={icon}
    />
  )
}

FormMessage.Error = ({
  title = 'Ошибка',
  type = 'error',
  isVisibile = true,
  message = 'Попробуйте еще раз',
  props,
  icon = <IconInfoCircle />,
}: FormMessageOptionalProps) => {
  return (
    <FormMessage
      title={title}
      type={type}
      isVisibile={isVisibile}
      message={message}
      props={props}
      icon={icon}
    />
  )
}

export { FormMessage }
