'use client'

import { overlay } from 'overlay-kit'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/lib/components/ui/dialog'
import { Button } from '@/lib/components/ui/button'

interface ConfirmOptions {
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
}

interface AlertOptions {
  title?: string
  description: string
  confirmText?: string
}

function confirm({
  title = '확인',
  description,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close }) => (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resolve(false)
            close()
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resolve(false)
                close()
              }}
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                resolve(true)
                close()
              }}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ))
  })
}

function alert({
  title = '알림',
  description,
  confirmText = '확인',
}: AlertOptions): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close }) => (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resolve()
            close()
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                resolve()
                close()
              }}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ))
  })
}

export const popup = { alert, confirm }
