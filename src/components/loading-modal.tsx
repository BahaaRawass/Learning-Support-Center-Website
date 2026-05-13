import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Spinner } from "./ui/spinner";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

type LoadingModalProps = {
  open: boolean;
  message?: string;
};

export default function LoadingModal({ open, message }: LoadingModalProps) {
  return (
    <Dialog
      open={open}
      as='div'
      className='relative z-10 focus:outline-none'
      onClose={() => {}}
    >
      <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4'>
          <DialogBackdrop className='fixed inset-0 bg-black/15' />
          <DialogPanel
            transition
            className='w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0'
          >
            <Card className='ring-0! shadow-none!'>
              <CardHeader>
                <CardTitle className='text-2xl'>
                  <DialogTitle className='flex items-center gap-3'>
                    <Spinner className='size-7' />
                    {message || "Loading..."}
                  </DialogTitle>
                </CardTitle>
                <CardDescription>
                  Wait a moment while we process your request.
                </CardDescription>
              </CardHeader>
            </Card>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
