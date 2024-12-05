'use client';
import { SearchIcon, Slash } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PlaceDetail, ResponseList, SearchSchema } from '@/components/type';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  constructPlaceEntityQuery,
  constructPlaceEntityQueryWikiData,
  constructPlaceHasSameAsQuery,
} from '@/lib/query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Infobox from '@/components/info-box';

export default function Data({ params }: { params: { resource: string } }) {
  const router = useRouter();

  const {
    data: placeData,
    isLoading: loadingPlace,
    isFetched,
    error: errorPlace,
  } = useQuery<ResponseList<PlaceDetail>>({
    queryKey: ['placeData'],
    queryFn: async () => {
      const responseHas = await axios.post(`/api/sparql`, {
        query: constructPlaceHasSameAsQuery(params.resource),
      });
      const hasSameAsValue =
        responseHas?.data.results?.bindings?.[0]?.hasSameAs?.value;
      const response = await axios.post(`/api/sparql`, {
        query:
          hasSameAsValue === 'true'
            ? constructPlaceEntityQueryWikiData(params.resource)
            : constructPlaceEntityQuery(params.resource),
      });

      return response.data;
    },
  });

  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    mode: 'all',
    defaultValues: {
      place: placeData?.results.bindings[0].placeName?.value || '',
    },
  });

  function onSubmit(data: z.infer<typeof SearchSchema>) {
    router.push(`/search?place=${data.place}`);
  }

  useEffect(() => {
    form.setValue(
      'place',
      placeData?.results.bindings[0].placeName?.value || ''
    );
  }, [placeData]);

  return (
    <div className="min-h-screen space-y-5">
      <div className="w-full h-20 bg-white px-[100px] 2xl:px-[300px] flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">KG Bunshin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/search`}>Search</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex gap-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex ring-2 rounded-2xl relative ring-white ring-opacity-50 w-[500px]">
                        <SearchIcon className="absolute top-2 left-2" />
                        <Input
                          className="rounded-r-none rounded-l-2xl pl-10"
                          placeholder="Cari destinasi"
                          {...field}
                        />
                        <Button
                          className="rounded-l-none rounded-r-2xl bg-blue-500 px-10 font-semibold"
                          type="submit"
                        >
                          Cari
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
      {isFetched && placeData && placeData.results.bindings.length > 0 && (
        <Infobox
          placeName={placeData?.results.bindings[0].placeName?.value}
          latitude={
            placeData?.results.bindings[0].latitude
              ? parseFloat(placeData.results.bindings[0].latitude.value)
              : undefined
          }
          longitude={
            placeData?.results.bindings[0].longitude
              ? parseFloat(placeData.results.bindings[0].longitude.value)
              : undefined
          }
          description={placeData?.results.bindings[0].desc?.value}
          categoryLabel={placeData?.results.bindings[0].categoryLabel?.value}
          rating={placeData?.results.bindings[0].valRating?.value}
          ratingDate={placeData?.results.bindings[0].timeRating?.value}
          cityName={placeData?.results.bindings[0].cityName?.value}
          wikidataCityURI={
            placeData?.results.bindings[0].wikidataCityURI?.value
          }
          timeSpent={placeData?.results.bindings[0].timeSpent?.value}
          timePrice={placeData?.results.bindings[0].timePrice?.value}
          priceGeneral={
            placeData?.results.bindings[0].priceGeneral
              ? parseFloat(placeData.results.bindings[0].priceGeneral.value)
              : undefined
          }
          priceWeekday={
            placeData?.results.bindings[0].priceWeekday
              ? parseFloat(placeData.results.bindings[0].priceWeekday.value)
              : undefined
          }
          priceWeekend={
            placeData?.results.bindings[0].priceWeekend
              ? parseFloat(placeData.results.bindings[0].priceWeekend.value)
              : undefined
          }
          wikidataPlaceURI={
            placeData?.results.bindings[0].wikidataPlaceURI?.value
          }
          imageUrl={placeData?.results.bindings[0].wdImageURL?.value}
          officialWebsite={
            placeData?.results.bindings[0].officialWebsite?.value
          }
          categories={
            placeData?.results.bindings[0].aggregatedCategoryLabels?.value
          }
          visitors={placeData?.results.bindings[0].visitorNum?.value}
          visitorYear={placeData?.results.bindings[0].visitorYear?.value}
          elevationAboveSeaLevel={
            placeData?.results.bindings[0].elevationAboveSeaLevel?.value
          }
          inceptionYear={placeData?.results.bindings[0].inceptionYear?.value}
        />
      )}
    </div>
  );
}
