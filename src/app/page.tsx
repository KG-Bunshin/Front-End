'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDownIcon, MapPinIcon, SearchIcon } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  fetchImageFromWikidata,
  getAllCity,
  getCityMostPlaces,
  getTop10Query,
} from '@/lib/query';
import { extractEntityFromURL, getCategoryImage } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  City,
  CityChip,
  Place,
  ResponseList,
  SearchSchema,
} from '@/components/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const router = useRouter();

  const [placesImage, setPlacesImage] = useState<string[]>([]);
  const [citiesImage, setCitiesImage] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const {
    data: places,
    isLoading: loadingPlaces,
    error: errorPlaces,
  } = useQuery<ResponseList<Place>>({
    queryKey: ['top10'],
    queryFn: async () => {
      const response = await axios.post(`/api/sparql`, {
        query: getTop10Query,
      });

      return response.data;
    },
  });

  const {
    data: cities,
    isLoading: loadingCity,
    error: errorCity,
  } = useQuery<ResponseList<City>>({
    queryKey: ['mostPlaces'],
    queryFn: async () => {
      const response = await axios.post(`/api/sparql`, {
        query: getCityMostPlaces,
      });

      return response.data;
    },
  });

  const {
    data: citiesChip,
    isLoading: loadingCities,
    error: errorCities,
  } = useQuery<ResponseList<CityChip>>({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await axios.post(`/api/sparql`, {
        query: getAllCity,
      });

      return response.data;
    },
  });

  useEffect(() => {
    const fetchImagePlaces = async () => {
      if (!places?.results?.bindings?.length) return;

      const imageUrls = await Promise.all(
        places.results.bindings.map(async (place) => {
          if (place.sameAs) {
            const entityId = extractEntityFromURL(place.sameAs.value);
            const imageURL = await fetchImageFromWikidata(entityId);
            if (imageURL) {
              return imageURL;
            } else {
              return getCategoryImage(place.type.value);
            }
          } else {
            return getCategoryImage(place.type.value);
          }
        })
      );

      setPlacesImage(imageUrls);
    };

    const fetchImageCity = async () => {
      if (!cities?.results?.bindings?.length) return;

      const imageUrls = await Promise.all(
        cities.results.bindings.map(async (city) => {
          if (city.sameAs) {
            const entityId = extractEntityFromURL(city.sameAs.value);
            const imageURL = await fetchImageFromWikidata(entityId);
            return imageURL;
          } else {
            return '';
          }
        })
      );

      setCitiesImage(imageUrls);
    };

    fetchImagePlaces();
    fetchImageCity();
  }, [places, cities]);

  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    mode: 'all',
    defaultValues: {
      place: '',
    },
  });

  function onSubmit(data: z.infer<typeof SearchSchema>) {
    router.push(`/search?place=${data.place}`);
  }

  return (
    <main className="space-y-20">
      {/* HERO */}
      <div className="fit relative">
        <div className="relative w-full h-[400px]">
          <Image
            className="rounded-br-[100px]"
            src="/background.jpeg" // Ganti dengan path gambar Anda
            alt="Hero Background"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="absolute inset-0 flex w-full h-full px-[100px] 2xl:px-[300px] pt-[100px] justify-between">
          <div className="w-2/5 space-y-7">
            <p className="text-white font-semibold text-3xl">
              Pengalaman seru untuk liburan tak terlupakan
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-white text-black text-lg">
                  <MapPinIcon />
                  <p>Pilih Destinasi</p>
                  <ChevronDownIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader className="mb-3">
                  <DialogTitle className="font-bold text-xl text-center">
                    Pilih Kota Destinasi
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap gap-5 overflow-auto">
                  {citiesChip &&
                    citiesChip.results.bindings.length > 0 &&
                    citiesChip.results.bindings.map((city, idx) => (
                      <Badge
                        variant="outline"
                        className="text-base cursor-pointer"
                        key={idx}
                        onClick={() => {
                          router.push(
                            `/search?city=${extractEntityFromURL(
                              city.resource.value
                            )}`
                          );
                          setOpen(false);
                        }}
                      >
                        {extractEntityFromURL(city.resource.value)}
                      </Badge>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-5/12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex ring-2 rounded-2xl relative ring-white ring-opacity-50">
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
      </div>

      {/* BODY */}
      <div className="px-[100px] 2xl:px-[300px] space-y-10 pb-20">
        <div className="space-y-3">
          <p className="text-2xl font-semibold">
            Destinasi impian di Indonesia
          </p>
          <Carousel className="w-full">
            <CarouselContent>
              {places &&
                places.results.bindings.length > 0 &&
                places.results.bindings.map((place, index) => (
                  <CarouselItem key={index} className="basis-1/5">
                    <div className="p-1">
                      <Card>
                        <Link
                          href={`/page/${extractEntityFromURL(
                            place.resource.value
                          )}`}
                        >
                          <CardContent
                            className="relative flex aspect-square bg-cover bg-center rounded-lg shadow-lg overflow-hidden"
                            style={{
                              backgroundImage: `url(${
                                placesImage[index] || ''
                              })`, // Fallback if imageURL is undefined
                            }}
                          >
                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                            <p className="absolute top-4 left-4 text-white font-bold text-2xl">
                              {place.label.value}
                            </p>
                          </CardContent>
                        </Link>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-semibold">
            Kota yang wajib dikunjungin di Indonesia
          </p>
          <Carousel className="w-full">
            <CarouselContent>
              {cities &&
                cities.results.bindings.length > 0 &&
                cities.results.bindings.map((city, index) => (
                  <CarouselItem key={index} className="basis-1/5">
                    <div className="p-1">
                      <Card>
                        <Link
                          href={`/search?city=${extractEntityFromURL(
                            city.resource.value
                          )}`}
                        >
                          <CardContent
                            className="relative flex aspect-square bg-cover bg-center rounded-lg shadow-lg overflow-hidden"
                            style={{
                              backgroundImage: `url(${
                                citiesImage[index] != ''
                                  ? citiesImage[index]
                                  : '/placeholder.jpg'
                              })`, // Fallback if imageURL is undefined
                            }}
                          >
                            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                            <p className="absolute top-4 left-4 text-white font-bold text-2xl">
                              {city.label
                                ? city.label.value
                                : extractEntityFromURL(city.resource.value)}
                            </p>
                            <p className="absolute bottom-4 left-4 text-white font-bold text-xl">
                              {city.placeCount.value} Destinasi Wisata
                            </p>
                          </CardContent>
                        </Link>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </main>
  );
}
