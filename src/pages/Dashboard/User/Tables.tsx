import React from "react";
import { Table } from "antd";
import type { TableProps } from "antd";

interface DataType {
  key: string;
  purpose: string;
  dataType: string;
  lawBasis: string;
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Company",
    dataIndex: "company",
    key: "company",
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "duedate",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "duedate",
  },
];

const data: DataType[] = [
  {
    key: "1",
    purpose: "To train and improve the accuracy of the Project.",
    dataType: "Identity Contact and Voice",
    lawBasis: "Consent ",
  },
  {
    key: "2",
    purpose:
      "To enhance your experience by personalizing interactions with the Project.",
    dataType: "Identity Contact Profile and  Voice",
    lawBasis: "Consent ",
  },
  {
    key: "3",
    purpose:
      "To manage our relationship with you which will include: Notifying you about changes to our terms or Privacy Policy Asking you to leave a review or take a survey",
    dataType: "Identity Contact Profile Voice",
    lawBasis:
      "Performance of a contract with you Necessary to comply with a legal obligation Necessary for our legitimate interests (to keep our records updated and to study how persons use our services)",
  },
];

const Tables: React.FC = () => (
  <Table className="!bg-black" columns={columns} dataSource={data} pagination={false} />
);

export default Tables;
