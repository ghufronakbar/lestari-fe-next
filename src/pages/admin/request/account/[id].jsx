import { Container, Heading, Flex } from "@chakra-ui/react";
import SidebarMenu from "@/component/SidebarMenu";
import { withAuth } from "@/lib/authorization";
import {
  Box,
  Button,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,  
  Text,
  useToast,
  Spacer,
  TableContainer,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { axiosInstance } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import  Loading  from "@/component/Loading";

function RequestDataID() {
  return (
    <>      
      <main>
        <Flex>
          <SidebarMenu flex={1} />
          <Container maxW="80%">
            <Heading marginBottom="8" marginTop="8">
              Request Account
            </Heading>
            <DetailReqAccount />
          </Container>
        </Flex>
      </main>
    </>
  );
}
const DetailReqAccount = () => {
  const router = useRouter();
  const { id } = router.query;
  const [requestAccount, setRequestAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqDataResponse = await axiosInstance.get(`/request/account/${id}`);
        setRequestAccount(reqDataResponse.data.values[0]);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        console.error("Error fetching detail request data:", error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  function formatDate(dateString) {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  const handleApprove = async () => {
    try {
      await axiosInstance.put(`/request/account/approve/${id}`, { approve: 2 });
      setIsModalOpen(false);
      // Refresh data after approval
      const reqDataResponse = await axiosInstance.get(`/request/account/${id}`);
      setRequestAccount(reqDataResponse.data.values[0]);
      toast({
        title: "Request has been approved",
        status: "success",
      });
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async () => {
    try {
      await axiosInstance.put(`/request/account/approve/${id}`, { approve: 1 });
      setIsModalOpen(false);
      const reqDataResponse = await axiosInstance.get(`/request/account/${id}`);
      setRequestAccount(reqDataResponse.data.values[0]);
      toast({
        title: "Request has been rejected",
        status: "warning",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (loading) return <Loading/>
  if (error) return <div>Error fetching data</div>;

  return (
    <>
      {requestAccount && (
        <Box>
          <Flex>
            <Box flex={5}>
              <Text fontWeight="semibold" fontSize="3xl" mb={2}>
                {requestAccount.subject}
              </Text>
              <Text>{requestAccount.body}</Text>
            </Box>
            <Spacer />
            <Box flex={4} mt={4}>
              <Box p={8} borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Text fontSize="xl" fontWeight="semibold">
                  {requestAccount.name}
                </Text>
                <Text as="em" fontSize="l">
                  {requestAccount.email}
                </Text>
                <Box mt={4}>
                  <TableContainer>
                  <Table>
                    <Tbody>
                      <Tr>
                        <Th>Profession</Th>
                        <Td>{requestAccount.profession}</Td>
                      </Tr>
                      <Tr>
                        <Th>Instances</Th>
                        <Td>{requestAccount.instances}</Td>
                      </Tr>
                      <Tr>
                        <Th>Send at</Th>
                        <Td>{formatDate(requestAccount.date)}</Td>
                      </Tr>
                    </Tbody>
                  </Table>


                  </TableContainer>
                </Box>
                <Center mt={4}>
                  {requestAccount.approve == 0 && (
                    <Button
                      borderRadius="md"
                      bg="#CBD5E0"
                      color="white"
                      px={4}
                      h={8}
                      onClick={() => setIsModalOpen(true)}
                    >
                      Pending
                    </Button>
                  )}
                  {requestAccount.approve == 1 && (
                    <Button
                      borderRadius="md"
                      bg="#E53E3E"
                      color="white"
                      px={4}
                      h={8}
                      onClick={() => {
                        toast({
                          title: "Request has been rejected",
                          status: "warning",
                        });
                      }}
                    >
                      Rejected
                    </Button>
                  )}
                  {requestAccount.approve == 2 && (
                    <Button
                      borderRadius="md"
                      bg="#48BB78"
                      color="white"
                      px={4}
                      h={8}
                      onClick={() => {
                        toast({
                          title: "Request has been approved",
                          status: "success",
                        });
                      }}
                     
                    >
                      Approved
                    </Button>
                  )}
                </Center>
              </Box>
            </Box>
          </Flex>
        </Box>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              <Center flex={1}>
                <Button
                  borderRadius="md"
                  bg="#E53E3E"
                  color="white"
                  px={4}
                  h={8}
                  onClick={handleReject} 
                >
                  Reject
                </Button>
              </Center>
              <Center flex={1}>
                <Button
                  borderRadius="md"
                  bg="#48BB78"
                  color="white"
                  px={4}
                  h={8}
                  onClick={handleApprove} // Handle approve action
                >
                  Approve
                </Button>
              </Center>
            </Flex>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default withAuth(RequestDataID);
