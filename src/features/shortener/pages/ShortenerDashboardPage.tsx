import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { CreateShortUrlPayload, ShortUrlItem } from '@/definitions'
import {
  useCreateShortUrlMutation,
  useDeleteShortUrlMutation,
  useShortUrlsQuery,
  useSystemStatsQuery,
} from '../hooks/useShortUrls'

const { Title, Text, Paragraph } = Typography

export const ShortenerDashboardPage = () => {
  const [form] = Form.useForm<CreateShortUrlPayload>()
  const [lastCreated, setLastCreated] = useState<ShortUrlItem | null>(null)

  const { data: urls = [], isLoading, refetch } = useShortUrlsQuery()
  const { data: stats } = useSystemStatsQuery()
  const createMutation = useCreateShortUrlMutation()
  const deleteMutation = useDeleteShortUrlMutation()

  const handleCreate = async (values: CreateShortUrlPayload) => {
    try {
      const result = await createMutation.mutateAsync({
        originalUrl: values.originalUrl,
        customAlias: values.customAlias || undefined,
        expiresInDays: values.expiresInDays || undefined,
      })
      setLastCreated(result)
      form.resetFields()
      message.success('Đã tạo link rút gọn thành công!')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      message.error(axiosErr.response?.data?.message || 'Không thể tạo link rút gọn')
    }
  }

  const handleCopy = async (shortLink: string) => {
    await navigator.clipboard.writeText(shortLink)
    message.success('Đã sao chép: ' + shortLink)
  }

  const columns: ColumnsType<ShortUrlItem> = [
    {
      title: 'Mã rút gọn',
      dataIndex: 'shortCode',
      key: 'shortCode',
      render: (code: string, record) => (
        <Space>
          <a
            href={`/r/${code}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono font-semibold text-blue-600 hover:underline"
          >
            /r/{code}
          </a>
          <Button size="small" onClick={() => handleCopy(record.shortLink)}>
            Copy
          </Button>
        </Space>
      ),
    },
    {
      title: 'URL gốc',
      dataIndex: 'originalUrl',
      key: 'originalUrl',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-blue-600">
          {url}
        </a>
      ),
    },
    {
      title: 'Lượt click',
      dataIndex: 'clickCount',
      key: 'clickCount',
      width: 120,
      render: (count: number) => <Tag color="blue">{count.toLocaleString()}</Tag>,
    },
    {
      title: 'Instance xử lý',
      dataIndex: 'servedByInstance',
      key: 'servedByInstance',
      width: 160,
      render: (inst: string) => <Tag color="purple">{inst}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa link rút gọn này?"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger size="small" loading={deleteMutation.isPending}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Title level={2} className="!mb-1">
              URL Shortener — Infra Lab
            </Title>
            <Paragraph className="!mb-0 text-slate-500">
              .NET 10 API + React 19 (Vite) + PostgreSQL + Redis Cache
            </Paragraph>
          </div>

          <Space wrap>
            <Tag color={stats?.databaseConnected ? 'success' : 'error'}>
              PostgreSQL: {stats?.databaseConnected ? 'Connected' : 'Disconnected'}
            </Tag>
            <Tag color={stats?.redisConnected ? 'success' : 'warning'}>
              Redis: {stats?.redisConnected ? 'Connected' : 'Fallback/Memory'}
            </Tag>
            {stats?.instanceName && <Tag color="geekblue">Host: {stats.instanceName}</Tag>}
          </Space>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Statistic title="Tổng số Link" value={stats?.totalUrls ?? urls.length} />
          </Card>
          <Card>
            <Statistic title="Tổng lượt Click" value={stats?.totalClicks ?? 0} />
          </Card>
          <Card>
            <Statistic title="Môi trường Runtime" value={stats?.environment ?? 'Development'} />
          </Card>
        </div>

        <Card title="Tạo link rút gọn mới">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            initialValues={{ expiresInDays: 30 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Form.Item
                name="originalUrl"
                label="URL gốc"
                className="md:col-span-2"
                rules={[
                  { required: true, message: 'Vui lòng nhập URL gốc' },
                  { type: 'url', message: 'URL không đúng định dạng (http/https)' },
                ]}
              >
                <Input placeholder="https://example.com/very-long-article-path" size="large" />
              </Form.Item>

              <Form.Item name="customAlias" label="Custom Alias (tùy chọn)">
                <Input placeholder="vd: infra-lab" size="large" />
              </Form.Item>

              <Form.Item name="expiresInDays" label="Hết hạn (ngày)">
                <InputNumber min={1} max={365} className="!w-full" size="large" />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createMutation.isPending}
            >
              Rút gọn URL
            </Button>
          </Form>

          {lastCreated && (
            <Alert
              className="mt-4"
              type="success"
              showIcon
              message={
                <Space>
                  <Text>Link vừa tạo:</Text>
                  <a
                    href={`/r/${lastCreated.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold"
                  >
                    {lastCreated.shortLink}
                  </a>
                  <Button size="small" onClick={() => handleCopy(lastCreated.shortLink)}>
                    Copy
                  </Button>
                </Space>
              }
            />
          )}
        </Card>

        <Card
          title="Danh sách URL gần đây"
          extra={<Button onClick={() => refetch()}>Làm mới</Button>}
        >
          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={urls}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </div>
  )
}
