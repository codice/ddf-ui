import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Modal,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import { CheckOutlined } from '@material-ui/icons'
import { COMMANDS, Certificate, CertificateDetails } from '../fetch/fetch'

const UploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  inputValues,
  setInputValues,
  activeTab,
  setActiveTab,
  selectedFile,
  handleFileChange,
  handleUrlChange,
  isLoading,
  urlError,
  urlCertDetails,
  activeStore,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent) => void
  inputValues: any
  setInputValues: (values: any) => void
  activeTab: number
  setActiveTab: (tab: number) => void
  selectedFile: File | null
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleUrlChange: (url: string) => void
  isLoading: boolean
  urlError: string
  urlCertDetails: CertificateDetails[]
  activeStore: 'trust' | 'key' | null
}) => (
  <Modal open={isOpen} onClose={onClose}>
    <Paper
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: 24,
        width: '80%',
        maxWidth: 1000,
        borderRadius: 4,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {activeStore === 'key' ? 'Add Private Key' : 'Add Trusted Certificate'}
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab
          label={
            activeStore === 'key' ? 'Upload Private Key' : 'Upload Certificate'
          }
        />
        <Tab label="URL Certificate" />
      </Tabs>

      <Box mt={2}>
        {activeTab === 0 ? (
          <form onSubmit={onSubmit}>
            <Box mb={2}>
              <TextField
                variant="outlined"
                label="Alias"
                required
                fullWidth
                value={inputValues.alias}
                onChange={(e) =>
                  setInputValues((prev: any) => ({
                    ...prev,
                    alias: e.target.value,
                  }))
                }
              />
            </Box>

            <Box mb={2}>
              <TextField
                variant="outlined"
                label="Key Password"
                type="password"
                required
                fullWidth
                value={inputValues.keypass || ''}
                onChange={(e) =>
                  setInputValues((prev: any) => ({
                    ...prev,
                    keypass: e.target.value,
                  }))
                }
              />
            </Box>

            <Box mb={2}>
              <TextField
                variant="outlined"
                label="Store Password"
                type="password"
                required
                fullWidth
                value={inputValues.storepass || ''}
                onChange={(e) =>
                  setInputValues((prev: any) => ({
                    ...prev,
                    storepass: e.target.value,
                  }))
                }
              />
            </Box>

            <Box mb={2}>
              <input
                type="file"
                accept=".cer,.crt,.pem,.der,.p7b,.p12,.pfx,.jks,.key"
                onChange={handleFileChange}
                required
              />
              {urlError && activeTab === 0 && (
                <Box color="error.main">
                  <Typography color="inherit">{urlError}</Typography>
                </Box>
              )}
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
          </form>
        ) : (
          <form onSubmit={onSubmit}>
            <Box mb={2}>
              <Typography>Certificate URL</Typography>
              <Box display="flex" flexDirection="column">
                <TextField
                  variant="outlined"
                  type="url"
                  required
                  fullWidth
                  value={inputValues.url || ''}
                  onChange={(e) => {
                    setInputValues((prev: any) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }}
                  style={{ marginBottom: 8 }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleUrlChange(inputValues.url)}
                  disabled={!inputValues.url}
                >
                  Show Certificate
                </Button>
              </Box>
            </Box>

            {urlError && (
              <Box mb={2} color="error.main">
                <Typography color="inherit">{urlError}</Typography>
              </Box>
            )}

            {urlCertDetails.length > 0 && (
              <Box mb={2}>
                <Typography variant="h6">Certificate Details</Typography>
                {urlCertDetails.map((cert, index) => (
                  <Box key={index} mt={1}>
                    <Typography>
                      Subject: {cert.subjectDn.rFC2253Name}
                    </Typography>
                    <Typography>Issuer: {cert.issuerDn.rFC2253Name}</Typography>
                    <Typography>
                      Valid: {new Date(cert.notBefore).toLocaleDateString()} -{' '}
                      {new Date(cert.notAfter).toLocaleDateString()}
                    </Typography>
                    <Typography>Type: {cert.type}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Box display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  isLoading || !inputValues.url || urlCertDetails.length === 0
                }
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Paper>
  </Modal>
)

export const SecurityCertificates: React.FC = () => {
  const [trustStoreCerts, setTrustStoreCerts] = useState<Certificate[]>([])
  const [keyStoreCerts, setKeyStoreCerts] = useState<Certificate[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [urlCertDetails, setUrlCertDetails] = useState<CertificateDetails[]>([])
  const [urlError, setUrlError] = useState<string>('')
  const [inputValues, setInputValues] = useState({
    alias: '',
    keypass: '',
    storepass: '',
    url: '',
  })
  const [activeStore, setActiveStore] = useState<'trust' | 'key' | null>(null)

  useEffect(() => {
    fetchCertificates()
    fetchKeyStore()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await COMMANDS.TRUSTSTORE.GET()
      setTrustStoreCerts(response.value)
    } catch (error) {
      console.error('Error fetching certificates:', error)
    }
  }

  const fetchKeyStore = async () => {
    try {
      const response = await COMMANDS.KEYSTORE.GET()
      setKeyStoreCerts(response.value)
    } catch (error) {
      console.error('Error fetching key store:', error)
    }
  }
  const handleDelete = async (alias: string, isKey: boolean) => {
    try {
      if (isKey) {
        await COMMANDS.KEYSTORE.DELETE({ alias })
      } else {
        await COMMANDS.TRUSTSTORE.DELETE({ alias })
      }
      fetchCertificates()
      fetchKeyStore()
    } catch (error) {
      console.error('Error deleting certificate:', error)
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.size > 5000000) {
        alert('File size must be less than 5MB')
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setUrlError('')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setUrlError('')

    try {
      if (activeTab === 0 && selectedFile) {
        const fileExtension =
          selectedFile.name.split('.').pop()?.toLowerCase() || ''
        const certType =
          fileExtension === 'pem'
            ? 'application/x-pem-file'
            : fileExtension === 'der'
            ? 'application/x-x509-ca-cert'
            : fileExtension === 'p7b'
            ? 'application/x-pkcs7-certificates'
            : fileExtension === 'p12' || fileExtension === 'pfx'
            ? 'application/x-pkcs12'
            : fileExtension === 'jks'
            ? 'application/x-java-keystore'
            : 'application/x-pem-file' // default to PEM if unknown extension

        const response = await (activeStore === 'key'
          ? COMMANDS.KEYSTORE.UPLOAD({
              file: selectedFile,
              alias: inputValues.alias,
              keyPassword: inputValues.keypass || '',
              storePassword: inputValues.storepass || '',
              fileName: selectedFile.name,
              type: certType,
            })
          : COMMANDS.TRUSTSTORE.POST({
              alias: inputValues.alias,
              cert: await selectedFile.text(),
              fileName: selectedFile.name,
              keyPassword: inputValues.keypass || '',
              storePassword: inputValues.storepass || '',
              type: certType,
            }))

        if (!response.success) {
          throw new Error(response.error || 'Upload failed')
        }
      } else if (activeTab === 1 && inputValues.url) {
        const certResponse = await COMMANDS.URLCERTIFICATE.SAVE({
          url: inputValues.url,
        })

        if (!certResponse.success) {
          throw new Error(
            certResponse.error || 'Failed to save URL certificate'
          )
        }
      }

      setIsModalOpen(false)
      fetchCertificates()
      fetchKeyStore()
    } catch (error) {
      console.error('Error uploading certificate:', error)
      setUrlError(error.message || 'Failed to upload certificate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = async (url: string) => {
    setUrlError('')
    setInputValues((prev) => ({ ...prev, url }))

    if (!url) {
      setUrlCertDetails([])
      return
    }

    try {
      const response = await COMMANDS.URLCERTIFICATE.GET({ url })
      if (response.success === false) {
        throw new Error(response.error || 'Failed to fetch certificate details')
      }
      setUrlCertDetails(response.value)
    } catch (error) {
      console.error('Error fetching URL certificate details:', error)
      setUrlError(error.message || 'Failed to fetch certificate details')
      setUrlCertDetails([])
    }
  }

  const CertificateTable = ({
    certificates,
    title,
    isKeyStore,
    onAdd,
  }: {
    certificates: Certificate[]
    title: string
    isKeyStore: boolean
    onAdd: () => void
  }) => (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        style={{ marginTop: 24 }}
      >
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Box>
          <Button
            color="primary"
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={onAdd}
            style={{ marginRight: 8 }}
          >
            {isKeyStore ? 'Add Private Key' : 'Add Trusted Certificate'}
          </Button>
        </Box>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Alias</TableCell>
            <TableCell>Is Key</TableCell>
            <TableCell>Algorithm</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {certificates
            .sort((a, b) => a.alias.localeCompare(b.alias))
            .map((cert) => (
              <TableRow key={cert.alias}>
                <TableCell>{cert.alias}</TableCell>
                <TableCell>{cert.isKey ? <CheckOutlined /> : ''}</TableCell>
                <TableCell>{cert.algorithm}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(cert.alias, isKeyStore)}
                    color="secondary"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  )

  return (
    <Box style={{ padding: 12 }}>
      <Typography variant="h4" gutterBottom>
        System Certificates
      </Typography>

      <CertificateTable
        certificates={trustStoreCerts}
        title="System Trust Store"
        isKeyStore={false}
        onAdd={() => {
          setActiveStore('trust')
          setIsModalOpen(true)
        }}
      />

      <CertificateTable
        certificates={keyStoreCerts}
        title="System Key Store"
        isKeyStore={true}
        onAdd={() => {
          setActiveStore('key')
          setIsModalOpen(true)
        }}
      />

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setActiveStore(null)
        }}
        onSubmit={handleSubmit}
        inputValues={inputValues}
        setInputValues={setInputValues}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFile={selectedFile}
        handleFileChange={handleFileChange}
        handleUrlChange={handleUrlChange}
        isLoading={isLoading}
        urlError={urlError}
        urlCertDetails={urlCertDetails}
        activeStore={activeStore}
      />
    </Box>
  )
}
