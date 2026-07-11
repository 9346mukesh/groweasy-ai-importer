"use client";

export default function StatusBadge({ status }) {
  const statusMap = {
    GOOD_LEAD_FOLLOW_UP: {
      label: "Good Lead",
      className:
        "bg-green-100 text-green-700 border-green-200",
    },

    DID_NOT_CONNECT: {
      label: "Did Not Connect",
      className:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
    },

    BAD_LEAD: {
      label: "Bad Lead",
      className:
        "bg-red-100 text-red-700 border-red-200",
    },

    SALE_DONE: {
      label: "Sale Done",
      className:
        "bg-blue-100 text-blue-700 border-blue-200",
    },
  };

  const badge =
    statusMap[status] || {
      label: status || "-",
      className:
        "bg-gray-100 text-gray-700 border-gray-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}