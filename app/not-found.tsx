import Link from "next/link";

export default function NotFound() {
  return (
    <div className='main-scroll detail-screen'>
      <Link className='back-link' href='/'>
        ← Back to Overview
      </Link>
      <div className='empty-state'>This page doesn&apos;t exist.</div>
    </div>
  );
}
