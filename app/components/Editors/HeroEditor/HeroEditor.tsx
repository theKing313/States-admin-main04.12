'use client'
import api from '@/app/api'
import { Fieldset, Stack, Button, TextInput, Group, LoadingOverlay, FileInput, Loader } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { HeroBlock } from '@/app/api/types'
import { useEffect } from 'react'
import FormMessage from '../../FormMessage'
import { useDisclosure } from '@mantine/hooks'

interface HeroBlockWithFiles extends HeroBlock {
  bgVideoFile?: File
  bgPosterFile?: File
}

function HeroEditor() {
  const { data: heroData, isLoading: isHeroDataLoading } = useQuery({
    queryKey: ['hero'],
    queryFn: () => api.getHero(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newHeroData: HeroBlockWithFiles | null | undefined) => {
      if (newHeroData) {
        delete newHeroData.bgPosterFile
        delete newHeroData.bgVideoFile
        return api.setBlock('hero', newHeroData as HeroBlock)
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const [videoUploading, videoUploadingControl] = useDisclosure(false)
  const [posterUploading, posterUploadingControl] = useDisclosure(false)

  const form = useForm<HeroBlockWithFiles>({})

  useEffect(() => {
    if (heroData) {
      form.setValues(heroData)
      form.resetDirty(heroData)
    }
  }, [heroData])

  return (
    <Fieldset pos='relative' legend='Hero элемент'>
      <LoadingOverlay visible={isHeroDataLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

      <form
        onSubmit={form.onSubmit(async (values) => {
          console.log(values)
          let hasErrors = false
          if (values.bgVideoFile) {
            videoUploadingControl.open()
            await api
              .uploadFile('hero-bgVideo', values.bgVideoFile)
              .then((res) => {
                const bgVideoUrl = api.sdk.storage.getFileView(api.blockContentBucket, 'hero-bgVideo')
                values.bgVideoUrl = bgVideoUrl.href
                values.bgVideoMimeType = values.bgVideoFile?.type || 'error'
              })
              .catch((err) => {
                hasErrors = true
                form.setFieldError(
                  'bgVideoFile',
                  err.message // === 'File extension not allowed' ? 'Недопустимый формат файла' : err.message,
                )
              })
              .finally(() => {
                videoUploadingControl.close()
              })
          }
          if (values.bgPosterFile) {
            posterUploadingControl.open()
            await api
              .uploadFile('hero-bgPoster', values.bgPosterFile)
              .then((res) => {
                const bgPosterUrl = api.sdk.storage.getFileView(api.blockContentBucket, 'hero-bgPoster')
                values.bgVideoPoster = bgPosterUrl.href
              })
              .catch((err) => {
                hasErrors = true
                form.setFieldError(
                  'bgPosterFile',
                  err.message // === 'File extension not allowed' ? 'Недопустимый формат файла' : err.message,
                )
              })
              .finally(() => {
                posterUploadingControl.close()
              })
          }
          if (hasErrors) return
          updateData(values)
        })}>
        <Stack align='flex-start' justify='flex-start' gap='lg'>
          <TextInput required miw={'30%'} label={'Верхняя строка'} {...form.getInputProps('upperText')} />
          <TextInput
            required
            miw={'30%'}
            label={'Основная строка'}
            description='Текст посередине'
            {...form.getInputProps('middleText')}
          />
          <TextInput required miw={'30%'} label={'Нижняя строка'} {...form.getInputProps('bottomText')} />
          {/* <TextInput miw={'30%'} label={'Ссылка на фоновое видео'} {...form.getInputProps('bgVideoUrl')} /> */}
          <Group miw={'30%'}>
            <FileInput
              maw={'50%'}
              w={'100%'}
              accept='video/*'
              label='Фоновый ролик'
              description='Загрузка файла. Файл должен быть в формате видео. И, желательно, весить как можно меньше'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps('bgVideoFile')}
            />
            {videoUploading && <Loader color='blue' />}
          </Group>
          <Group miw={'30%'}>
            <FileInput
              maw={'50%'}
              accept='image/*'
              label='Фоновый постер'
              description='Загрузка файла. Постер отображается во время открытия сайта, пока загружается видео. Или как подложка на случай, если с видео произошла ошибка. Лучше использовать первый кадр видео'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps('bgPosterFile')}
            />
            {posterUploading && <Loader color='blue' />}
          </Group>

          <Group w={'100%'}>
            <Button
              h={'100%'}
              mt={10}
              p={15}
              loading={posterUploading || videoUploading || isUpdating}
              type='submit'
              variant='default'>
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

export { HeroEditor }
