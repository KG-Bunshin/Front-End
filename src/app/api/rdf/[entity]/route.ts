import { getRDFGraph } from "@/lib/query";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const resource = request.nextUrl.pathname.replace("/api/rdf/", "");
  const alnumRegex = /^\w+$/;

  if (!alnumRegex.test(resource)) {
    return NextResponse.json(
      {
        message: "Only alphanumeric characters are supported",
      },
      { status: 400 }
    );
  }

  try {
    const query = getRDFGraph(resource);

    const response = await axios.get<string>(
      `${
        process.env.NEXT_PUBLIC_DB_HOST
      }/repositories/kgbunshin?query=${encodeURIComponent(query)}`,
      {
        params: {
          infer: false,
          sameAs: true,
        },
        headers: {
          Accept: ["text/turtle"],
        },
      }
    );

    const rdfGraph = response.data;

    if (!rdfGraph.includes(`kgb:${resource}`)) {
      return NextResponse.json(
        {
          message: "Invalid entity",
        },
        { status: 400 }
      );
    }

    return new Response(rdfGraph, {
      headers: {
        "Content-Type": "text/turtle",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);

    return NextResponse.json(
      {
        message: "Error fetching data",
      },
      { status: 500 }
    );
  }
}
