'use client'
import api from '@/app/api'
import { Fieldset, Stack, Button, TextInput, Group, LoadingOverlay, FileInput, Loader } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import { HeroBlock, VideoPlayerBlock } from '@/app/api/types'
import { useEffect } from 'react'
import FormMessage from '../../FormMessage'
import { useDisclosure } from '@mantine/hooks'

interface VideoPlayerBlockWithFiles extends VideoPlayerBlock {
  videoFile?: File
  posterFile?: File
}

function VideoPlayerEditor() {
  const { data: videoPlayerData, isLoading: isVideoPlayerDataLoading } = useQuery({
    queryKey: ['videoPlayer'],
    queryFn: () => api.getVideoPlayer(),
  })

  const {
    mutate: updateData,
    isLoading: isUpdating,
    isError: updateError,
    isSuccess: updateDone,
    reset,
  } = useMutation({
    mutationFn: async (newVideoPlayerData: VideoPlayerBlockWithFiles | null | undefined) => {
      if (newVideoPlayerData) {
        delete newVideoPlayerData.posterFile
        delete newVideoPlayerData.videoFile
        return api.setBlock('videoPlayer', newVideoPlayerData as VideoPlayerBlock)
      }
    },
    onSuccess: () => {
      setTimeout(reset, 2000)
    },
  })

  const [videoUploading, videoUploadingControl] = useDisclosure(false)
  const [posterUploading, posterUploadingControl] = useDisclosure(false)

  const form = useForm<VideoPlayerBlockWithFiles>({})

  useEffect(() => {
    if (videoPlayerData) {
      form.setValues(videoPlayerData)
      form.resetDirty(videoPlayerData)
    }
  }, [videoPlayerData])

  return (
    <Fieldset pos='relative' legend='VideoPlayer элемент'>
      <LoadingOverlay
        visible={isVideoPlayerDataLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />

      <form
        onSubmit={form.onSubmit(async (values) => {
          console.log(values)
          let hasErrors = false
          if (values.videoFile) {
            videoUploadingControl.open()
            await api
              .uploadFile('videoPlayer-video', values.videoFile)
              .then((res) => {
                const videoUrl = api.sdk.storage.getFileView(api.blockContentBucket, 'videoPlayer-video')
                values.videoUrl = videoUrl.href
                // values.bgVideoMimeType = values.bgVideoFile?.type || 'error'
              })
              .catch((err) => {
                hasErrors = true
                form.setFieldError(
                  'videoFile',
                  err.message // === 'File extension not allowed' ? 'Недопустимый формат файла' : err.message,
                )
              })
              .finally(() => {
                videoUploadingControl.close()
              })
          }
          if (values.posterFile) {
            posterUploadingControl.open()
            await api
              .uploadFile('videoPlayer-poster', values.posterFile)
              .then((res) => {
                const bgPosterUrl = api.sdk.storage.getFileView(api.blockContentBucket, 'videoPlayer-poster')
                values.backgroundImageUrl = bgPosterUrl.href
              })
              .catch((err) => {
                hasErrors = true
                form.setFieldError(
                  'posterFile',
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
          <Group miw={'30%'}>
            <FileInput
              w={'100%'}
              accept='video/*'
              label='Видео'
              description='Загрузка файла. Файл должен быть в формате видео.'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps('videoFile')}
            />
            {videoUploading && <Loader color='blue' />}
          </Group>
          <Group miw={'30%'}>
            <FileInput
              accept='image/*'
              label='Фоновый постер'
              description='Загрузка файла. Видео будет открываться при нажатии на постер'
              placeholder='Нажмите для загрузки'
              {...form.getInputProps('posterFile')}
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

export { VideoPlayerEditor }
