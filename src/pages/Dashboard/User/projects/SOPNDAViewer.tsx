import { useEffect } from 'react';
import { Button, message, Spin } from 'antd'
import { CheckOutlined, BookOutlined, SyncOutlined } from '@ant-design/icons'
import { MultiPDFViewerModal, useMultiPDFViewer } from '../../../../components'
import sopQueryService from '../../../../services/sop-service/sop-query';
import sopMutationService from '../../../../services/sop-service/sop-mutation';
import { getErrorMessage } from '../../../../service/apiUtils';

    const documentsToShow = [
        {
            key: 'sop',
            title: 'Standard Operating Procedure (SOP)',
            url: '/assets/pdfs/Standard_Operating_Procedure_(SOP)_for_Freelancers.pdf'
        },
        {
            key: 'nda', 
            title: 'Non-Disclosure Agreement (NDA)',
            url: '/assets/pdfs/MYDEEPTECH NDA.pdf'
        }
    ];

const SOPNDAViewer = () => {
    const { isVisible, documents, openMultiPDFViewer, closePDFViewer } = useMultiPDFViewer();
    const sopQuery = sopQueryService.useGetSOPAcceptanceStatus();
    const sopMutation = sopMutationService.useSOPAcceptance();

    // Define the documents to show
    const handleAcceptSop = () => {
        sopMutation.mutate(undefined, {
            onSuccess: () => {
                message.success('SOP accepted successfully!');
            },
            onError: (error) => {
                const errMsg = getErrorMessage(error);
                console.error('Error accepting SOP:', errMsg);
                message.error(errMsg);
            },
            onSettled: () => {
                sopQuery.refetch();
                closePDFViewer();
            },
        });
    }

    // Auto-open SOP modal when component mounts if SOP hasn't been accepted
    useEffect(() => {
        if (!sopQuery.hasAcceptedSop && !sopQuery.isLoading) {
            openMultiPDFViewer(documentsToShow);
        }
    }, [sopQuery.hasAcceptedSop, sopQuery.isLoading, openMultiPDFViewer]);

    if(sopQuery.isLoading) {
        return (
            <div className="flex items-center justify-center size-20 ml-auto">
                <Spin indicator={<SyncOutlined spin className='#000' />} size="small" />
            </div>
        );
    }

    if(sopQuery.hasAcceptedSop) return null;

  return (
    <>
      <Button
        onClick={() => openMultiPDFViewer(documentsToShow)}
        className="lg:ml-auto px-4 h-11 bg-[#F6921E] text-white font-[gilroy-regular] text-sm hover:bg-[#e5831c] transition-colors duration-200 border-[#F6921E] hover:border-[#e5831c]"
        type="primary"
        icon={<BookOutlined />}
      >
        {sopQuery.hasAcceptedSop ? 'View Documents' : 'Read Instructions'}
      </Button>

      {/* Multi-PDF Modal */}
      <MultiPDFViewerModal
        visible={isVisible}
        documents={documents}
        title={sopQuery.hasAcceptedSop ? "Project Documents" : "Please Read and Accept the SOP/NDA"}
        onClose={sopQuery.hasAcceptedSop ? closePDFViewer : () => {}} // Prevent closing if not accepted
        width={1200} // Wider for better multi-document viewing
        hideCloseButton={true} // Hide close button if SOP not accepted
        footerButtons={[
          // Show Accept button if SOP hasn't been accepted, Download buttons if it has
          !sopQuery.hasAcceptedSop ? (
            <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                <Button
                key="accept"
                type="primary"
                loading={sopMutation.isPending}
                onClick={handleAcceptSop}
                className="bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700"
                icon={<CheckOutlined />}
                >
                {sopMutation.isPending ? "Accepting..." : "Accept SOP/NDA"}
                </Button>
            </div>
          ) : (
            <div key="download-group" className="flex gap-2">
              <Button
                key="download-sop"
                type="primary"
                href="/assets/pdfs/Standard_Operating_Procedure_(SOP)_for_Freelancers.pdf"
                download="Standard_Operating_Procedure_(SOP)_for_Freelancers.pdf"
                className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c]"
              >
                Download SOP
              </Button>
              <Button
                key="download-nda"
                type="primary"
                href="/assets/pdfs/MYDEEPTECH NDA.pdf"
                download="MYDEEPTECH_NDA.pdf"
                className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c]"
              >
                Download NDA
              </Button>
            </div>
          )
        ]}
      />
    </>
  )
}

export default SOPNDAViewer