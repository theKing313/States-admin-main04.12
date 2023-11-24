'use client'
import api from '@/app/api'
import { Fieldset, Stack, Button, TextInput, Group, LoadingOverlay, Text, Divider } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { FooterBlock } from '@/app/api/types'
import { useEffect } from 'react'
import FormMessage from '../../FormMessage'

function FooterEditor() {
  const { data: footerData, isLoading: isFooterDataLoading } = useQuery({
    queryKey: ['footer'],
    queryFn: () => api.getFooter(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newFooterData: FooterBlock | null | undefined) => {
      if (newFooterData) {
        return api.setBlock('footer', newFooterData)
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const form = useForm<FooterBlock>({})

  useEffect(() => {
    if (footerData) {
      form.setValues(footerData)
      form.resetDirty(footerData)
    }
  }, [footerData])

  return (
    <Fieldset pos='relative' legend='Footer элемент'>
      <LoadingOverlay visible={isFooterDataLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

      <form
        onSubmit={form.onSubmit(async (values) => {
          const filteredLinks = values.socialLinks.filter(
            (linkItem) => linkItem.href !== '' || linkItem.title !== ''
          )
          values.socialLinks = filteredLinks
          // console.log(values)
          updateData(values)
        })}>
        <Stack align='flex-start' justify='flex-start' gap='lg'>
          <TextInput required miw={'30%'} label={'Номер телефона'} {...form.getInputProps('phoneNumber')} />
          <TextInput required miw={'30%'} label={'Почтовый адрес'} {...form.getInputProps('mail')} />
          <TextInput
            required
            miw={'30%'}
            label={'Контактная информация'}
            {...form.getInputProps('contactsInfo')}
          />
          <TextInput required miw={'30%'} label={'Адрес'} {...form.getInputProps('address')} />

          <Stack miw={'30%'}>
            <Divider my='sm' />
            <Text size='md'>Ссылки на социальные сети:</Text>
            {form.values.socialLinks &&
              form.values.socialLinks.map((val, index) => (
                <Group>
                  <TextInput label='Название' {...form.getInputProps(`socialLinks.${index}.title`)} />
                  <TextInput label='Ссылка' {...form.getInputProps(`socialLinks.${index}.href`)} />
                </Group>
              ))}
            <Button onClick={() => form.insertListItem('socialLinks', { title: '', href: '' })}>
              Добавить ссылку
            </Button>
            <Divider my='sm' />
          </Stack>

          <Group w={'100%'}>
            <Button h={'100%'} mt={10} p={15} loading={isUpdating} type='submit' variant='default'>
              Сохранить
            </Button>
            {updateError && <FormMessage.Error />}
            {updateDone && <FormMessage.Success />}
          </Group>
        </Stack>
      </form>
    </Fieldset>
  )
}

export { FooterEditor }
